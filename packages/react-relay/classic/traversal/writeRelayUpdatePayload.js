/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const RelayClassicRecordState = require('../store/RelayClassicRecordState');
const RelayMutationTracker = require('../store/RelayMutationTracker');
const RelayNodeInterface = require('../interface/RelayNodeInterface');
const RelayQuery = require('../query/RelayQuery');
const RelayQueryPath = require('../query/RelayQueryPath');

const generateClientEdgeID = require('../legacy/store/generateClientEdgeID');
const generateClientID = require('../legacy/store/generateClientID');
const getRangeBehavior = require('../mutation/getRangeBehavior');
const invariant = require('invariant');
const warning = require('warning');

const {MutationTypes} = require('RelayRuntime');
const {
  ConnectionInterface,
  RangeOperations,
  RelayProfiler,
} = require('RelayRuntime');

import type RelayQueryWriter from '../store/RelayQueryWriter';
import type RelayRecordStore from '../store/RelayRecordStore';
import type {UpdateOptions} from '../tools/RelayInternalTypes';
import type {DataID} from 'RelayRuntime';

// TODO: Replace with enumeration for possible config types.
/* OperationConfig was originally typed such that each property had the type
 * mixed.  Mixed is safer than any, but that safety comes from Flow forcing you
 * to inspect a mixed value at runtime before using it.  However these mixeds
 * are ending up everywhere and are not being inspected */
type OperationConfig = {[key: string]: $FlowFixMe};
type Payload = mixed | PayloadObject | PayloadArray;
type PayloadArray = Array<Payload>;
type PayloadObject = {[key: string]: Payload};

const {ANY_TYPE, ID, NODE} = RelayNodeInterface;
const {APPEND, IGNORE, PREPEND, REFETCH, REMOVE} = RangeOperations;

let _edgesField;
function getEdgesField() {
  if (!_edgesField) {
    _edgesField = RelayQuery.Field.build({
      fieldName: ConnectionInterface.get().EDGES,
      type: ANY_TYPE,
      metadata: {
        canHaveSubselections: true,
        isPlural: true,
      },
    });
  }
  return _edgesField;
}

const STUB_CURSOR_ID = 'client:cursor';

/**
 * @internal
 *
 * Applies the results of an update operation (mutation/subscription) to the
 * store.
 */
function writeRelayUpdatePayload(
  writer: RelayQueryWriter,
  operation: RelayQuery.Operation,
  payload: PayloadObject,
  {configs, isOptimisticUpdate}: UpdateOptions,
): void {
  configs.forEach(config => {
    switch (config.type) {
      case MutationTypes.NODE_DELETE:
        handleNodeDelete(writer, payload, config);
        break;
      case MutationTypes.RANGE_ADD:
        handleRangeAdd(writer, payload, operation, config, isOptimisticUpdate);
        break;
      case MutationTypes.RANGE_DELETE:
        handleRangeDelete(writer, payload, config);
        break;
      case MutationTypes.FIELDS_CHANGE:
      case MutationTypes.REQUIRED_CHILDREN:
        break;
      default:
        console.error(
          'Expected a valid mutation handler type, got `%s`.',
          config.type,
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
  payload: PayloadObject,
  config: OperationConfig,
): void {
  const recordIDs = payload[config.deletedIDFieldName];
  if (!recordIDs) {
    // for some mutations, deletions don't always occur so if there's no field
    // in the payload, carry on
    return;
  }

  if (Array.isArray(recordIDs)) {
    recordIDs.forEach(id => {
      /* $FlowFixMe(>=0.36.0) Flow error detected during
       * the deploy of Flow v0.36.0. To see the error, remove this comment and
       * run Flow */
      deleteRecord(writer, id);
    });
  } else {
    // $FlowFixMe(>=0.33.0)
    deleteRecord(writer, recordIDs);
  }
}

/**
 * Deletes the record from the store, also removing any references to the node
 * from any ranges that contain it (along with the containing edges).
 */
function deleteRecord(writer: RelayQueryWriter, recordID: DataID): void {
  const store = writer.getRecordStore();
  const recordWriter = writer.getRecordWriter();
  // skip if already deleted
  const status = store.getRecordState(recordID);
  if (status === RelayClassicRecordState.NONEXISTENT) {
    return;
  }

  // Delete the node from any ranges it may be a part of
  const connectionIDs = store.getConnectionIDsForRecord(recordID);
  if (connectionIDs) {
    connectionIDs.forEach(connectionID => {
      const edgeID = generateClientEdgeID(connectionID, recordID);
      recordWriter.applyRangeUpdate(connectionID, edgeID, REMOVE);
      writer.recordUpdate(edgeID);
      writer.recordUpdate(connectionID);
      // edges are never nodes, so this will not infinitely recurse
      deleteRecord(writer, edgeID);
    });
  }

  // delete the node
  recordWriter.deleteRecord(recordID);
  writer.recordUpdate(recordID);
}

/**
 * Handles merging the results of the mutation/subscription into the store,
 * updating each top-level field in the data according the fetched
 * fields/fragments.
 */
function handleMerge(
  writer: RelayQueryWriter,
  payload: PayloadObject,
  operation: RelayQuery.Operation,
): void {
  const store = writer.getRecordStore();

  // because optimistic payloads may not contain all fields, we loop over
  // the data that is present and then have to recurse the query to find
  // the matching fields.
  //
  // TODO #7167718: more efficient mutation/subscription writes
  for (const fieldName in payload) {
    if (!Object.prototype.hasOwnProperty.call(payload, fieldName)) {
      continue;
    }
    const payloadData = (payload[fieldName]: $FlowIssue); // #9357395
    if (typeof payloadData !== 'object' || payloadData == null) {
      continue;
    }

    // check for valid data (has an ID or is an array) and write the field
    if (
      ID in payloadData ||
      // if the field is an argument-less root call, determine the corresponding
      // root record ID
      store.getDataID(fieldName) ||
      Array.isArray(payloadData)
    ) {
      mergeField(writer, fieldName, payloadData, operation);
    }
  }
}

/**
 * Merges the results of a single top-level field into the store.
 */
function mergeField(
  writer: RelayQueryWriter,
  fieldName: string,
  payload: PayloadObject | PayloadArray,
  operation: RelayQuery.Operation,
): void {
  // don't write mutation/subscription metadata fields
  const {CLIENT_MUTATION_ID} = ConnectionInterface.get();
  if (fieldName === 'error' || fieldName === CLIENT_MUTATION_ID) {
    return;
  }
  if (Array.isArray(payload)) {
    payload.forEach(item => {
      if (typeof item === 'object' && item != null && !Array.isArray(item)) {
        if (getString(item, ID)) {
          mergeField(writer, fieldName, item, operation);
        }
      }
    });
    return;
  }
  // reassign to preserve type information in below closure
  const payloadData = payload;

  const store = writer.getRecordStore();
  let recordID = getString(payloadData, ID);
  let path;

  if (recordID != null) {
    path = RelayQueryPath.createForID(recordID, 'writeRelayUpdatePayload');
  } else {
    recordID = store.getDataID(fieldName);
    if (!recordID) {
      invariant(
        false,
        'writeRelayUpdatePayload(): Expected a record ID in the response ' +
          'payload supplied to update the store for field `%s`, ' +
          'payload keys [%s], operation name `%s`.',
        fieldName,
        Object.keys(payload).join(', '),
        operation.getName(),
      );
    }

    // Root fields that do not accept arguments
    path = RelayQueryPath.create(
      RelayQuery.Root.build(
        'writeRelayUpdatePayload',
        fieldName,
        null,
        null,
        {
          identifyingArgName: null,
          identifyingArgType: null,
          isAbstract: true,
          isDeferred: false,
          isPlural: false,
        },
        ANY_TYPE,
      ),
    );
  }
  // write the results for only the current field, for every instance of that
  // field in any subfield/fragment in the query.
  const handleNode = node => {
    node.getChildren().forEach(child => {
      if (child instanceof RelayQuery.Fragment) {
        handleNode(child);
      } else if (
        child instanceof RelayQuery.Field &&
        child.getSerializationKey() === fieldName
      ) {
        // for flow: types are lost in closures
        if (path && recordID) {
          // ensure the record exists and then update it
          writer.createRecordIfMissing(child, recordID, path, payloadData);
          writer.writePayload(child, recordID, payloadData, path);
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
  payload: PayloadObject,
  operation: RelayQuery.Operation,
  config: OperationConfig,
  isOptimisticUpdate: boolean,
): void {
  const {CLIENT_MUTATION_ID} = ConnectionInterface.get();

  const clientMutationID = getString(payload, CLIENT_MUTATION_ID);
  invariant(
    clientMutationID,
    'writeRelayUpdatePayload(): Expected operation `%s` to have a `%s`.',
    operation.getName(),
    CLIENT_MUTATION_ID,
  );
  const store = writer.getRecordStore();

  // Extracts the new edge from the payload
  const edge = getObject(payload, config.edgeName);
  const edgeNode = edge && getObject(edge, NODE);
  if (!edge || !edgeNode) {
    return;
  }

  // Extract the id of the node with the connection that we are adding to.
  let connectionParentID = config.parentID;
  if (!connectionParentID) {
    const edgeSource = getObject(edge, 'source');
    if (edgeSource) {
      connectionParentID = getString(edgeSource, ID);
    }
  }
  invariant(
    connectionParentID,
    'writeRelayUpdatePayload(): Cannot insert edge without a configured ' +
      '`parentID` or a `%s.source.id` field.',
    config.edgeName,
  );

  const nodeID = getString(edgeNode, ID) || generateClientID();
  const cursor = edge.cursor || STUB_CURSOR_ID;
  const edgeData = {
    ...edge,
    cursor: cursor,
    node: {
      ...edgeNode,
      id: nodeID,
    },
  };

  // add the node to every connection for this field
  const connectionIDs = store.getConnectionIDsForField(
    connectionParentID,
    config.connectionName,
  );
  if (connectionIDs) {
    connectionIDs.forEach(connectionID =>
      addRangeNode(writer, operation, config, connectionID, nodeID, edgeData),
    );
  }

  if (isOptimisticUpdate) {
    // optimistic updates need to record the generated client ID for
    // a to-be-created node
    RelayMutationTracker.putClientIDForMutation(nodeID, clientMutationID);
  } else {
    // non-optimistic updates check for the existence of a generated client
    // ID (from the above `if` clause) and link the client ID to the actual
    // server ID.
    const clientNodeID = RelayMutationTracker.getClientIDForMutation(
      clientMutationID,
    );
    if (clientNodeID) {
      RelayMutationTracker.updateClientServerIDMap(clientNodeID, nodeID);
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
  edgeData: any,
) {
  const store = writer.getRecordStore();
  const recordWriter = writer.getRecordWriter();
  const filterCalls = store.getRangeFilterCalls(connectionID);
  const rangeBehavior = filterCalls
    ? getRangeBehavior(config.rangeBehaviors, filterCalls)
    : null;

  // no range behavior specified for this combination of filter calls
  if (!rangeBehavior) {
    warning(
      rangeBehavior,
      'Using `null` as a rangeBehavior value is deprecated. Use `ignore` to avoid ' +
        'refetching a range.',
    );
    return;
  }

  if (rangeBehavior === IGNORE) {
    return;
  }

  const edgeID = generateClientEdgeID(connectionID, nodeID);
  let path = store.getPathToRecord(connectionID);
  invariant(
    path,
    'writeRelayUpdatePayload(): Expected a path for connection record, `%s`.',
    connectionID,
  );
  const edgesField = getEdgesField();
  path = RelayQueryPath.getPath(path, edgesField, edgeID);

  // create the edge record
  writer.createRecordIfMissing(edgesField, edgeID, path, edgeData);

  // write data for all `edges` fields
  // TODO #7167718: more efficient mutation/subscription writes
  let hasEdgeField = false;
  const handleNode = node => {
    node.getChildren().forEach(child => {
      if (child instanceof RelayQuery.Fragment) {
        handleNode(child);
      } else if (
        child instanceof RelayQuery.Field &&
        child.getSchemaName() === config.edgeName
      ) {
        hasEdgeField = true;
        if (path) {
          writer.writePayload(child, edgeID, edgeData, path);
        }
      }
    });
  };
  handleNode(operation);

  invariant(
    hasEdgeField,
    'writeRelayUpdatePayload(): Expected mutation query to include the ' +
      'relevant edge field, `%s`.',
    config.edgeName,
  );

  // append/prepend the item to the range.
  if (
    rangeBehavior === APPEND ||
    rangeBehavior === IGNORE ||
    rangeBehavior === PREPEND ||
    rangeBehavior === REFETCH ||
    rangeBehavior === REMOVE
  ) {
    recordWriter.applyRangeUpdate(
      connectionID,
      edgeID,
      (rangeBehavior: $FlowFixMe),
    );
    writer.recordUpdate(connectionID);
  } else {
    console.error(
      'writeRelayUpdatePayload(): invalid range operation `%s`, valid ' +
        'options are `%s`, `%s`, `%s`, `%s`, or `%s`.',
      rangeBehavior,
      APPEND,
      PREPEND,
      IGNORE,
      REMOVE,
      REFETCH,
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
  payload: PayloadObject,
  config: OperationConfig,
): void {
  const store = writer.getRecordStore();

  let recordIDs = null;

  if (Array.isArray(config.deletedIDFieldName)) {
    recordIDs = getIDsFromPath(store, config.deletedIDFieldName, payload);
  } else {
    recordIDs = payload[config.deletedIDFieldName];

    // Coerce numbers to strings for backwards compatibility.
    if (typeof recordIDs === 'number') {
      warning(
        false,
        'writeRelayUpdatePayload(): Expected `%s` to be a string, got the ' +
          'number `%s`.',
        config.deletedIDFieldName,
        recordIDs,
      );
      recordIDs = '' + recordIDs;
    }

    invariant(
      recordIDs == null ||
        (!Array.isArray(recordIDs) || typeof recordIDs !== 'string'),
      'writeRelayUpdatePayload(): Expected `%s` to be an array/string, got `%s`.',
      config.deletedIDFieldName,
      JSON.stringify(recordIDs),
    );

    if (!Array.isArray(recordIDs)) {
      recordIDs = [recordIDs];
    }
  }

  invariant(
    recordIDs != null,
    'writeRelayUpdatePayload(): Missing ID(s) for deleted record at field `%s`.',
    config.deletedIDFieldName,
  );

  // Extract the id of the node with the connection that we are deleting from.
  const connectionName = config.pathToConnection.pop();
  const connectionParentIDs = getIDsFromPath(
    store,
    config.pathToConnection,
    payload,
  );
  // Restore pathToConnection to its original state
  config.pathToConnection.push(connectionName);
  if (!connectionParentIDs) {
    return;
  }
  const connectionParentID = connectionParentIDs[0];

  const connectionIDs = store.getConnectionIDsForField(
    connectionParentID,
    connectionName,
  );
  if (connectionIDs) {
    connectionIDs.forEach(connectionID => {
      if (recordIDs) {
        recordIDs.forEach(recordID => {
          deleteRangeEdge(writer, connectionID, recordID);
        });
      }
    });
  }
}

/**
 * Removes an edge from a connection without modifying the node data.
 */
function deleteRangeEdge(
  writer: RelayQueryWriter,
  connectionID: DataID,
  nodeID: DataID,
): void {
  const recordWriter = writer.getRecordWriter();
  const edgeID = generateClientEdgeID(connectionID, nodeID);
  recordWriter.applyRangeUpdate(connectionID, edgeID, REMOVE);

  deleteRecord(writer, edgeID);
  writer.recordUpdate(connectionID);
}

/**
 * Given a payload of data and a path of fields, extracts the `id` of the node(s)
 * specified by the path.
 *
 * Examples:
 * path: ['root', 'field']
 * data: {root: {field: {id: 'xyz'}}}
 *
 * path: ['root', 'field']
 * data: {root: {field: [{id: 'abc'}, {id: 'def'}]}}
 *
 * Returns:
 * ['xyz']
 *
 * ['abc', 'def']
 */
function getIDsFromPath(
  store: RelayRecordStore,
  path: Array<string>,
  payload: PayloadObject,
): ?Array<string> {
  // We have a special case for the path for root nodes without ids like
  // ['viewer']. We try to match it up with something in the root call mapping
  // first.
  if (path.length === 1) {
    const rootCallID = store.getDataID(path[0]);
    if (rootCallID) {
      return [rootCallID];
    }
  }

  let payloadItems = payload;
  path.forEach((step, idx) => {
    if (!payloadItems || Array.isArray(payloadItems)) {
      return;
    }
    if (idx === path.length - 1) {
      payloadItems = getObjectOrArray(payloadItems, step);
    } else {
      payloadItems = getObject(payloadItems, step);
    }
  });

  if (payloadItems) {
    if (!Array.isArray(payloadItems)) {
      payloadItems = [payloadItems];
    }
    return payloadItems.map(item => {
      const id = getString(item, ID);
      invariant(
        id != null,
        'writeRelayUpdatePayload(): Expected `%s.id` to be a string.',
        path.join('.'),
      );
      return id;
    });
  }
  return null;
}

function getString(payload: PayloadObject, field: string): ?string {
  let value = payload[field];
  // Coerce numbers to strings for backwards compatibility.
  if (typeof value === 'number') {
    warning(
      false,
      'writeRelayUpdatePayload(): Expected `%s` to be a string, got the ' +
        'number `%s`.',
      field,
      value,
    );
    value = '' + value;
  }
  invariant(
    value == null || typeof value === 'string',
    'writeRelayUpdatePayload(): Expected `%s` to be a string, got `%s`.',
    field,
    JSON.stringify(value),
  );
  return value;
}

function getObject(payload: PayloadObject, field: string): ?PayloadObject {
  const value = payload[field];
  invariant(
    value == null || (typeof value === 'object' && !Array.isArray(value)),
    'writeRelayUpdatePayload(): Expected `%s` to be an object, got `%s`.',
    field,
    JSON.stringify(value),
  );
  return value;
}

function getObjectOrArray(
  payload: PayloadObject,
  field: string,
): ?PayloadArray | ?PayloadObject {
  const value = payload[field];
  invariant(
    value == null || typeof value === 'object',
    'writeRelayUpdatePayload(): Expected `%s` to be an object/array, got `%s`.',
    field,
    JSON.stringify(value),
  );
  return value;
}

module.exports = RelayProfiler.instrument(
  'writeRelayUpdatePayload',
  writeRelayUpdatePayload,
);
