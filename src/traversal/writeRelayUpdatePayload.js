/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule writeRelayUpdatePayload
 * @flow
 * @typechecks
 */

'use strict';

var GraphQLMutatorConstants = require('GraphQLMutatorConstants');
var RelayConnectionInterface = require('RelayConnectionInterface');
import type {
  Call,
  DataID,
  RangeBehaviors,
  UpdateOptions
} from 'RelayInternalTypes';
var RelayMutationTracker = require('RelayMutationTracker');
var RelayMutationType = require('RelayMutationType');
var RelayNodeInterface = require('RelayNodeInterface');
var RelayQuery = require('RelayQuery');
var RelayQueryPath = require('RelayQueryPath');
import type RelayQueryWriter from 'RelayQueryWriter';
var RelayProfiler = require('RelayProfiler');
var RelayRecordState = require('RelayRecordState');
import type RelayRecordStore from 'RelayRecordStore';

var generateClientEdgeID = require('generateClientEdgeID');
var generateClientID = require('generateClientID');
var invariant = require('invariant');
var printRelayQueryCall = require('printRelayQueryCall');
var warning = require('warning');

// TODO: Replace with enumeration for possible config types.
/* OperationConfig was originally typed such that each property had the type
 * mixed.  Mixed is safer than any, but that safety comes from Flow forcing you
 * to inspect a mixed value at runtime before using it.  However these mixeds
 * are ending up everywhere and are not being inspected */
type OperationConfig = {[key: string]: $FlowFixMe};

type Payload = Object;

var {CLIENT_MUTATION_ID, EDGES} = RelayConnectionInterface;
var {APPEND, PREPEND, REMOVE} = GraphQLMutatorConstants;

var EDGES_FIELD = RelayQuery.Field.build(
  EDGES,
  null,
  null,
  {plural: true}
);
var ID = 'id';
var IGNORED_KEYS = {
  error: true,
  /* $FlowIssue #7728187 - Computed Property */
  [CLIENT_MUTATION_ID]: true,
};
var STUB_CURSOR_ID = 'client:cursor';

/**
 * @internal
 *
 * Applies the results of an update operation (mutation/subscription) to the
 * store.
 */
function writeRelayUpdatePayload(
  writer: RelayQueryWriter,
  operation: RelayQuery.Operation,
  payload: {[key: string]: mixed},
  {configs, isOptimisticUpdate}: UpdateOptions
): void {
  configs.forEach(config => {
    switch (config.type) {
      case RelayMutationType.NODE_DELETE:
        handleNodeDelete(writer, payload, config);
        break;
      case RelayMutationType.RANGE_ADD:
        handleRangeAdd(
          writer,
          payload,
          operation,
          config,
          isOptimisticUpdate
        );
        break;
      case RelayMutationType.RANGE_DELETE:
        handleRangeDelete(writer, payload, config);
        break;
      case RelayMutationType.FIELDS_CHANGE:
      case RelayMutationType.REQUIRED_CHILDREN:
        break;
      default:
        console.error(
          'Expected a valid mutation handler type, got `%s`.',
          config.type
        );
    }
  });

  handleMerge(writer, payload, operation);
}

/**
 * Handles the payload for a node deletion mutation, reading the ID of the node
 * to delete from the payload based on the config and then deleting references
 * to the node.
 */
function handleNodeDelete(
  writer: RelayQueryWriter,
  payload: Payload,
  config: OperationConfig
): void {
  var recordIDs = payload[config.deletedIDFieldName];
  if (!recordIDs) {
    // for some mutations, deletions don't always occur so if there's no field
    // in the payload, carry on
    return;
  }

  if (Array.isArray(recordIDs)) {
    recordIDs.forEach(id => {
      deleteRecord(writer, id);
    });
  } else {
    deleteRecord(writer, recordIDs);
  }
}

/**
 * Deletes the record from the store, also removing any references to the node
 * from any ranges that contain it (along with the containing edges).
 */
function deleteRecord(
  writer: RelayQueryWriter,
  recordID: DataID
): void {
  var store = writer.getRecordStore();
  // skip if already deleted
  var status = store.getRecordState(recordID);
  if (status === RelayRecordState.NONEXISTENT) {
    return;
  }

  // Delete the node from any ranges it may be a part of
  var connectionIDs = store.getConnectionIDsForRecord(recordID);
  if (connectionIDs) {
    connectionIDs.forEach(connectionID => {
      var edgeID = generateClientEdgeID(connectionID, recordID);
      store.applyRangeUpdate(connectionID, edgeID, REMOVE);
      writer.recordUpdate(edgeID);
      writer.recordUpdate(connectionID);
      // edges are never nodes, so this will not infinitely recurse
      deleteRecord(writer, edgeID);
    });
  }

  // delete the node
  store.deleteRecord(recordID);
  writer.recordUpdate(recordID);
}

/**
 * Handles merging the results of the mutation/subscription into the store,
 * updating each top-level field in the data according the fetched
 * fields/fragments.
 */
function handleMerge(
  writer: RelayQueryWriter,
  payload: Payload,
  operation: RelayQuery.Operation
): void {
  var store = writer.getRecordStore();

  // because optimistic payloads may not contain all fields, we loop over
  // the data that is present and then have to recurse the query to find
  // the matching fields.
  //
  // TODO #7167718: more efficient mutation/subscription writes
  for (var fieldName in payload) {
    if (!payload.hasOwnProperty(fieldName)) {
      continue;
    }
    var payloadData = payload[fieldName];
    if (payloadData == null || typeof payloadData !== 'object') {
      continue;
    }
    // if the field is an argument-less root call, determine the corresponding
    // root record ID
    var rootID = store.getDataID(fieldName);
    // check for valid data (has an ID or is an array) and write the field
    if (
      ID in payloadData ||
      rootID ||
      Array.isArray(payloadData)
    ) {
      mergeField(
        writer,
        fieldName,
        (payloadData: $FixMe), // checked above: != null and typeof object
        operation
      );
    }
  }
}

/**
 * Merges the results of a single top-level field into the store.
 */
function mergeField(
  writer: RelayQueryWriter,
  fieldName: string,
  payload: Payload | Array<Payload>,
  operation: RelayQuery.Operation
): void {
  // don't write mutation/subscription metadata fields
  if (fieldName in IGNORED_KEYS) {
    return;
  }
  if (Array.isArray(payload)) {
    payload.forEach(item => {
      if (item[ID]) {
        mergeField(writer, fieldName, item, operation);
      }
    });
    return;
  }
  // reassign to preserve type information in below closure
  var payloadData = payload;

  var store = writer.getRecordStore();
  var recordID = payloadData[ID];
  var path;

  if (recordID) {
    path = new RelayQueryPath(
      RelayQuery.Root.build(
        RelayNodeInterface.NODE,
        recordID,
        null,
        {identifyingArgName: RelayNodeInterface.ID}
      )
    );
  } else {
    recordID = store.getDataID(fieldName);
    // Root fields that do not accept arguments
    path = new RelayQueryPath(RelayQuery.Root.build(fieldName));
  }
  invariant(
    recordID,
    'writeRelayUpdatePayload(): Expected a record ID in the response payload ' +
    'supplied to update the store.'
  );

  // write the results for only the current field, for every instance of that
  // field in any subfield/fragment in the query.
  var handleNode = (node) => {
    node.getChildren().forEach(child => {
      if (child instanceof RelayQuery.Fragment) {
        handleNode(child);
      } else if (
        child instanceof RelayQuery.Field &&
        child.getSerializationKey() === fieldName
      ) {
        // for flow: types are lost in closures
        if (path && recordID) {
          var typeName = writer.getRecordTypeName(
            child,
            recordID,
            payloadData
          );
          // ensure the record exists and then update it
          writer.createRecordIfMissing(
            child,
            recordID,
            typeName,
            path
          );
          writer.writePayload(
            child,
            recordID,
            payloadData,
            path
          );
        }
      }
    });
  };
  handleNode(operation);
}

/**
 * Handles the payload for a range addition. The configuration specifies:
 * - which field in the payload contains data for the new edge
 * - the list of fetched ranges to which the edge should be added
 * - whether to append/prepend to each of those ranges
 */
function handleRangeAdd(
  writer: RelayQueryWriter,
  payload: Payload,
  operation: RelayQuery.Operation,
  config: OperationConfig,
  isOptimisticUpdate: boolean
): void {
  var clientMutationID = payload[CLIENT_MUTATION_ID];
  var store = writer.getRecordStore();

  // Extracts the new edge from the payload
  var edge = payload[config.edgeName];
  if (!edge || !edge.node) {
    warning(
      false,
      'writeRelayUpdatePayload(): Expected response payload to include the ' +
      'newly created edge `%s` and its `node` field. Did you forget to ' +
      'update the `RANGE_ADD` mutation config?',
      config.edgeName
    );
    return;
  }

  // Extract the id of the node with the connection that we are adding to.
  var connectionParentID = config.parentID || (edge.source && edge.source.id);
  invariant(
    connectionParentID,
    'writeRelayUpdatePayload(): Cannot insert edge without a configured ' +
    '`parentID` or a `%s.source.id` field.',
    config.edgeName
  );

  var nodeID = edge.node.id || generateClientID();
  var cursor = edge.cursor || STUB_CURSOR_ID;
  var edgeData = {
    ...edge,
    cursor: cursor,
    node: {
      ...edge.node,
      id: nodeID
    }
  };

  // add the node to every connection for this field
  var connectionIDs =
    store.getConnectionIDsForField(connectionParentID, config.connectionName);
  if (connectionIDs) {
    connectionIDs.forEach(connectionID => addRangeNode(
      writer,
      operation,
      config,
      connectionID,
      nodeID,
      edgeData
    ));
  }

  if (isOptimisticUpdate) {
    // optimistic updates need to record the generated client ID for
    // a to-be-created node
    RelayMutationTracker.putClientIDForMutation(
      nodeID,
      clientMutationID
    );
  } else {
    // non-optimistic updates check for the existence of a generated client
    // ID (from the above `if` clause) and link the client ID to the actual
    // server ID.
    var clientNodeID =
      RelayMutationTracker.getClientIDForMutation(clientMutationID);
    if (clientNodeID) {
      RelayMutationTracker.updateClientServerIDMap(
        clientNodeID,
        nodeID
      );
      RelayMutationTracker.deleteClientIDForMutation(clientMutationID);
    }
  }
}

/**
 * Writes the node data for the given field to the store and prepends/appends
 * the node to the given connection.
 */
function addRangeNode(
  writer: RelayQueryWriter,
  operation: RelayQuery.Operation,
  config: OperationConfig,
  connectionID: DataID,
  nodeID: DataID,
  edgeData: any
) {
  var store = writer.getRecordStore();
  var filterCalls = store.getRangeFilterCalls(connectionID);
  var rangeBehavior = filterCalls ?
    getRangeBehavior(config.rangeBehaviors, filterCalls) :
    null;

  // no range behavior specified for this combination of filter calls
  if (!rangeBehavior) {
    return;
  }

  var edgeID = generateClientEdgeID(connectionID, nodeID);
  var path = store.getPathToRecord(connectionID);
  invariant(
    path,
    'writeRelayUpdatePayload(): Expected a path for connection record, `%s`.',
    connectionID
  );
  path = path.getPath(EDGES_FIELD, edgeID);

  // create the edge record
  var typeName = writer.getRecordTypeName(EDGES_FIELD, edgeID, edgeData);
  writer.createRecordIfMissing(EDGES_FIELD, edgeID, typeName, path);

  // write data for all `edges` fields
  // TODO #7167718: more efficient mutation/subscription writes
  var hasEdgeField = false;
  var handleNode = (node) => {
    node.getChildren().forEach(child => {
      if (child instanceof RelayQuery.Fragment) {
        handleNode(child);
      } else if (
        child instanceof RelayQuery.Field &&
        child.getSchemaName() === config.edgeName
      ) {
        hasEdgeField = true;
        if (path) {
          writer.writePayload(
            child,
            edgeID,
            edgeData,
            path
          );
        }
      }
    });
  };
  handleNode(operation);

  invariant(
    hasEdgeField,
    'writeRelayUpdatePayload(): Expected mutation query to include the ' +
    'relevant edge field, `%s`.',
    config.edgeName
  );

  // append/prepend the item to the range.
  if (rangeBehavior in GraphQLMutatorConstants.RANGE_OPERATIONS) {
    store.applyRangeUpdate(connectionID, edgeID, (rangeBehavior: any));
    if (writer.hasChangeToRecord(edgeID)) {
      writer.recordUpdate(connectionID);
    }
  } else {
    console.error(
      'writeRelayUpdatePayload(): invalid range operation `%s`, valid ' +
      'options are `%s` or `%s`.',
      rangeBehavior,
      APPEND,
      PREPEND
    );
  }
}

/**
 * Handles the payload for a range edge deletion, which removes the edge from
 * a specified range but does not delete the node for that edge. The config
 * specifies the path within the payload that contains the connection ID.
 */
function handleRangeDelete(
  writer: RelayQueryWriter,
  payload: Payload,
  config: OperationConfig
): void {
  var recordID = payload[config.deletedIDFieldName];
  invariant(
    recordID !== undefined,
    'writeRelayUpdatePayload(): Missing ID for deleted record at field `%s`.',
    config.deletedIDFieldName
  );

  // Extract the id of the node with the connection that we are deleting from.
  var store = writer.getRecordStore();
  var connectionName = config.pathToConnection.pop();
  var connectionParentID =
    getIDFromPath(store, config.pathToConnection, payload);
  // Restore pathToConnection to its original state
  config.pathToConnection.push(connectionName);
  if (!connectionParentID) {
    return;
  }

  var connectionIDs = store.getConnectionIDsForField(
    connectionParentID,
    connectionName
  );
  if (connectionIDs) {
    connectionIDs.forEach(connectionID => {
      deleteRangeEdge(writer, connectionID, recordID);
    });
  }
}

/**
 * Removes an edge from a connection without modifying the node data.
 */
function deleteRangeEdge(
  writer: RelayQueryWriter,
  connectionID: DataID,
  nodeID: DataID
): void {
  var store = writer.getRecordStore();
  var edgeID = generateClientEdgeID(connectionID, nodeID);
  store.applyRangeUpdate(connectionID, edgeID, REMOVE);

  deleteRecord(writer, edgeID);
  if (writer.hasChangeToRecord(edgeID)) {
    writer.recordUpdate(connectionID);
  }
}

/**
 * Return the action (prepend/append) to use when adding an item to
 * the range with the specified calls.
 *
 * Ex:
 * rangeBehaviors: `{'orderby(recent)': 'append'}`
 * calls: `[{name: 'orderby', value: 'recent'}]`
 *
 * Returns `'append'`
 */
function getRangeBehavior(
  rangeBehaviors: RangeBehaviors,
  calls: Array<Call>
): ?string {
  var call = calls.map(printRelayQueryCall).join('').slice(1);
  return rangeBehaviors[call] || null;
}

/**
 * Given a payload of data and a path of fields, extracts the `id` of the node
 * specified by the path.
 *
 * Example:
 * path: ['root', 'field']
 * data: {root: {field: {id: 'xyz'}}}
 *
 * Returns:
 * 'xyz'
 */
function getIDFromPath(
  store: RelayRecordStore,
  path: Array<string>,
  payload: Payload
): ?string {
  // We have a special case for the path for root nodes without ids like
  // ['viewer']. We try to match it up with something in the root call mapping
  // first.
  if (path.length === 1) {
    var rootCallID = store.getDataID(path[0]);
    if (rootCallID) {
      return rootCallID;
    }
  }
  for (var ii = 0; ii < path.length; ii++) {
    var step = path[ii];
    if (!payload || typeof payload !== 'object') {
      return null;
    }
    payload = payload[step];
  }
  if (payload && typeof payload === 'object') {
    return payload.id;
  }
  return null;
}

module.exports = RelayProfiler.instrument(
  'writeRelayUpdatePayload',
  writeRelayUpdatePayload
);
