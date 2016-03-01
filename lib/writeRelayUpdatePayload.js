/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule writeRelayUpdatePayload
 * 
 * @typechecks
 */

'use strict';

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var GraphQLMutatorConstants = require('./GraphQLMutatorConstants');
var RelayConnectionInterface = require('./RelayConnectionInterface');

var RelayMutationTracker = require('./RelayMutationTracker');
var RelayMutationType = require('./RelayMutationType');
var RelayNodeInterface = require('./RelayNodeInterface');
var RelayQuery = require('./RelayQuery');
var RelayQueryPath = require('./RelayQueryPath');

var RelayProfiler = require('./RelayProfiler');
var RelayRecordState = require('./RelayRecordState');

var generateClientEdgeID = require('./generateClientEdgeID');
var generateClientID = require('./generateClientID');
var invariant = require('fbjs/lib/invariant');
var serializeRelayQueryCall = require('./serializeRelayQueryCall');
var warning = require('fbjs/lib/warning');

// TODO: Replace with enumeration for possible config types.
/* OperationConfig was originally typed such that each property had the type
 * mixed.  Mixed is safer than any, but that safety comes from Flow forcing you
 * to inspect a mixed value at runtime before using it.  However these mixeds
 * are ending up everywhere and are not being inspected */
var CLIENT_MUTATION_ID = RelayConnectionInterface.CLIENT_MUTATION_ID;
var EDGES = RelayConnectionInterface.EDGES;
var ANY_TYPE = RelayNodeInterface.ANY_TYPE;
var ID = RelayNodeInterface.ID;
var ID_TYPE = RelayNodeInterface.ID_TYPE;
var NODE = RelayNodeInterface.NODE;
var NODE_TYPE = RelayNodeInterface.NODE_TYPE;
var APPEND = GraphQLMutatorConstants.APPEND;
var PREPEND = GraphQLMutatorConstants.PREPEND;
var REMOVE = GraphQLMutatorConstants.REMOVE;

var EDGES_FIELD = RelayQuery.Field.build({
  fieldName: EDGES,
  type: ANY_TYPE,
  metadata: {
    canHaveSubselections: true,
    isPlural: true
  }
});
var IGNORED_KEYS = _defineProperty({
  error: true
}, CLIENT_MUTATION_ID, true);
var STUB_CURSOR_ID = 'client:cursor';

/**
 * @internal
 *
 * Applies the results of an update operation (mutation/subscription) to the
 * store.
 */
function writeRelayUpdatePayload(writer, operation, payload, _ref) {
  var configs = _ref.configs;
  var isOptimisticUpdate = _ref.isOptimisticUpdate;

  configs.forEach(function (config) {
    switch (config.type) {
      case RelayMutationType.NODE_DELETE:
        handleNodeDelete(writer, payload, config);
        break;
      case RelayMutationType.RANGE_ADD:
        handleRangeAdd(writer, payload, operation, config, isOptimisticUpdate);
        break;
      case RelayMutationType.RANGE_DELETE:
        handleRangeDelete(writer, payload, config);
        break;
      case RelayMutationType.FIELDS_CHANGE:
      case RelayMutationType.REQUIRED_CHILDREN:
        break;
      default:
        console.error('Expected a valid mutation handler type, got `%s`.', config.type);
    }
  });

  handleMerge(writer, payload, operation);
}

/**
 * Handles the payload for a node deletion mutation, reading the ID of the node
 * to delete from the payload based on the config and then deleting references
 * to the node.
 */
function handleNodeDelete(writer, payload, config) {
  var recordIDs = payload[config.deletedIDFieldName];
  if (!recordIDs) {
    // for some mutations, deletions don't always occur so if there's no field
    // in the payload, carry on
    return;
  }

  if (Array.isArray(recordIDs)) {
    recordIDs.forEach(function (id) {
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
function deleteRecord(writer, recordID) {
  var store = writer.getRecordStore();
  var recordWriter = writer.getRecordWriter();
  // skip if already deleted
  var status = store.getRecordState(recordID);
  if (status === RelayRecordState.NONEXISTENT) {
    return;
  }

  // Delete the node from any ranges it may be a part of
  var connectionIDs = store.getConnectionIDsForRecord(recordID);
  if (connectionIDs) {
    connectionIDs.forEach(function (connectionID) {
      var edgeID = generateClientEdgeID(connectionID, recordID);
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
function handleMerge(writer, payload, operation) {
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
    var payloadData = payload[fieldName]; // #9357395
    if (typeof payloadData !== 'object' || payloadData == null) {
      continue;
    }
    // if the field is an argument-less root call, determine the corresponding
    // root record ID
    var rootID = store.getDataID(fieldName);
    // check for valid data (has an ID or is an array) and write the field
    if (ID in payloadData || rootID || Array.isArray(payloadData)) {
      mergeField(writer, fieldName, payloadData, operation);
    }
  }
}

/**
 * Merges the results of a single top-level field into the store.
 */
function mergeField(writer, fieldName, payload, operation) {
  // don't write mutation/subscription metadata fields
  if (fieldName in IGNORED_KEYS) {
    return;
  }
  if (Array.isArray(payload)) {
    payload.forEach(function (item) {
      if (typeof item === 'object' && item != null && !Array.isArray(item)) {
        if (getString(item, ID)) {
          mergeField(writer, fieldName, item, operation);
        }
      }
    });
    return;
  }
  // reassign to preserve type information in below closure
  var payloadData = payload;

  var store = writer.getRecordStore();
  var recordID = getString(payloadData, ID);
  var path = undefined;

  if (recordID != null) {
    path = new RelayQueryPath(RelayQuery.Root.build('writeRelayUpdatePayload', NODE, recordID, null, {
      identifyingArgName: ID,
      identifyingArgType: ID_TYPE,
      isAbstract: true,
      isDeferred: false,
      isPlural: false
    }, NODE_TYPE));
  } else {
    recordID = store.getDataID(fieldName);
    // Root fields that do not accept arguments
    path = new RelayQueryPath(RelayQuery.Root.build('writeRelayUpdatePayload', fieldName, null, null, {
      identifyingArgName: null,
      identifyingArgType: null,
      isAbstract: true,
      isDeferred: false,
      isPlural: false
    }, ANY_TYPE));
  }
  !recordID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Expected a record ID in the response payload ' + 'supplied to update the store.') : invariant(false) : undefined;

  // write the results for only the current field, for every instance of that
  // field in any subfield/fragment in the query.
  var handleNode = function handleNode(node) {
    node.getChildren().forEach(function (child) {
      if (child instanceof RelayQuery.Fragment) {
        handleNode(child);
      } else if (child instanceof RelayQuery.Field && child.getSerializationKey() === fieldName) {
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
function handleRangeAdd(writer, payload, operation, config, isOptimisticUpdate) {
  var clientMutationID = getString(payload, CLIENT_MUTATION_ID);
  !clientMutationID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Expected operation `%s` to have a `%s`.', operation.getName(), CLIENT_MUTATION_ID) : invariant(false) : undefined;
  var store = writer.getRecordStore();

  // Extracts the new edge from the payload
  var edge = getObject(payload, config.edgeName);
  var edgeNode = edge && getObject(edge, NODE);
  if (!edge || !edgeNode) {
    process.env.NODE_ENV !== 'production' ? warning(false, 'writeRelayUpdatePayload(): Expected response payload to include the ' + 'newly created edge `%s` and its `node` field. Did you forget to ' + 'update the `RANGE_ADD` mutation config?', config.edgeName) : undefined;
    return;
  }

  // Extract the id of the node with the connection that we are adding to.
  var connectionParentID = config.parentID;
  if (!connectionParentID) {
    var edgeSource = getObject(edge, 'source');
    if (edgeSource) {
      connectionParentID = getString(edgeSource, ID);
    }
  }
  !connectionParentID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Cannot insert edge without a configured ' + '`parentID` or a `%s.source.id` field.', config.edgeName) : invariant(false) : undefined;

  var nodeID = getString(edgeNode, ID) || generateClientID();
  var cursor = edge.cursor || STUB_CURSOR_ID;
  var edgeData = _extends({}, edge, {
    cursor: cursor,
    node: _extends({}, edgeNode, {
      id: nodeID
    })
  });

  // add the node to every connection for this field
  var connectionIDs = store.getConnectionIDsForField(connectionParentID, config.connectionName);
  if (connectionIDs) {
    connectionIDs.forEach(function (connectionID) {
      return addRangeNode(writer, operation, config, connectionID, nodeID, edgeData);
    });
  }

  if (isOptimisticUpdate) {
    // optimistic updates need to record the generated client ID for
    // a to-be-created node
    RelayMutationTracker.putClientIDForMutation(nodeID, clientMutationID);
  } else {
    // non-optimistic updates check for the existence of a generated client
    // ID (from the above `if` clause) and link the client ID to the actual
    // server ID.
    var clientNodeID = RelayMutationTracker.getClientIDForMutation(clientMutationID);
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
function addRangeNode(writer, operation, config, connectionID, nodeID, edgeData) {
  var store = writer.getRecordStore();
  var recordWriter = writer.getRecordWriter();
  var filterCalls = store.getRangeFilterCalls(connectionID);
  var rangeBehavior = filterCalls ? getRangeBehavior(config.rangeBehaviors, filterCalls) : null;

  // no range behavior specified for this combination of filter calls
  if (!rangeBehavior) {
    return;
  }

  var edgeID = generateClientEdgeID(connectionID, nodeID);
  var path = store.getPathToRecord(connectionID);
  !path ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Expected a path for connection record, `%s`.', connectionID) : invariant(false) : undefined;
  path = path.getPath(EDGES_FIELD, edgeID);

  // create the edge record
  writer.createRecordIfMissing(EDGES_FIELD, edgeID, path, edgeData);

  // write data for all `edges` fields
  // TODO #7167718: more efficient mutation/subscription writes
  var hasEdgeField = false;
  var handleNode = function handleNode(node) {
    node.getChildren().forEach(function (child) {
      if (child instanceof RelayQuery.Fragment) {
        handleNode(child);
      } else if (child instanceof RelayQuery.Field && child.getSchemaName() === config.edgeName) {
        hasEdgeField = true;
        if (path) {
          writer.writePayload(child, edgeID, edgeData, path);
        }
      }
    });
  };
  handleNode(operation);

  !hasEdgeField ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Expected mutation query to include the ' + 'relevant edge field, `%s`.', config.edgeName) : invariant(false) : undefined;

  // append/prepend the item to the range.
  if (rangeBehavior in GraphQLMutatorConstants.RANGE_OPERATIONS) {
    recordWriter.applyRangeUpdate(connectionID, edgeID, rangeBehavior);
    if (writer.hasChangeToRecord(edgeID)) {
      writer.recordUpdate(connectionID);
    }
  } else {
    console.error('writeRelayUpdatePayload(): invalid range operation `%s`, valid ' + 'options are `%s` or `%s`.', rangeBehavior, APPEND, PREPEND);
  }
}

/**
 * Handles the payload for a range edge deletion, which removes the edge from
 * a specified range but does not delete the node for that edge. The config
 * specifies the path within the payload that contains the connection ID.
 */
function handleRangeDelete(writer, payload, config) {
  var store = writer.getRecordStore();

  var recordID = Array.isArray(config.deletedIDFieldName) ? getIDFromPath(store, config.deletedIDFieldName, payload) : getString(payload, config.deletedIDFieldName);

  !(recordID != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Missing ID for deleted record at field `%s`.', config.deletedIDFieldName) : invariant(false) : undefined;

  // Extract the id of the node with the connection that we are deleting from.
  var connectionName = config.pathToConnection.pop();
  var connectionParentID = getIDFromPath(store, config.pathToConnection, payload);
  // Restore pathToConnection to its original state
  config.pathToConnection.push(connectionName);
  if (!connectionParentID) {
    return;
  }

  var connectionIDs = store.getConnectionIDsForField(connectionParentID, connectionName);
  if (connectionIDs) {
    connectionIDs.forEach(function (connectionID) {
      deleteRangeEdge(writer, connectionID, recordID);
    });
  }
}

/**
 * Removes an edge from a connection without modifying the node data.
 */
function deleteRangeEdge(writer, connectionID, nodeID) {
  var recordWriter = writer.getRecordWriter();
  var edgeID = generateClientEdgeID(connectionID, nodeID);
  recordWriter.applyRangeUpdate(connectionID, edgeID, REMOVE);

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
function getRangeBehavior(rangeBehaviors, calls) {
  var call = calls.map(serializeRelayQueryCall).sort().join('').slice(1);
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
function getIDFromPath(store, path, payload) {
  // We have a special case for the path for root nodes without ids like
  // ['viewer']. We try to match it up with something in the root call mapping
  // first.
  if (path.length === 1) {
    var rootCallID = store.getDataID(path[0]);
    if (rootCallID) {
      return rootCallID;
    }
  }
  var payloadItem = path.reduce(function (payloadItem, step) {
    return payloadItem ? getObject(payloadItem, step) : null;
  }, payload);
  if (payloadItem) {
    var id = getString(payloadItem, ID);
    !(id != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Expected `%s.id` to be a string.', path.join('.')) : invariant(false) : undefined;
    return id;
  }
  return null;
}

function getString(payload, field) {
  var value = payload[field];
  // Coerce numbers to strings for backwards compatibility.
  if (typeof value === 'number') {
    process.env.NODE_ENV !== 'production' ? warning(false, 'writeRelayUpdatePayload(): Expected `%s` to be a string, got the ' + 'number `%s`.', field, value) : undefined;
    value = '' + value;
  }
  !(value == null || typeof value === 'string') ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Expected `%s` to be a string, got `%s`.', field, JSON.stringify(value)) : invariant(false) : undefined;
  return value;
}

function getObject(payload, field) {
  var value = payload[field];
  !(value == null || typeof value === 'object' && !Array.isArray(value)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'writeRelayUpdatePayload(): Expected `%s` to be an object, got `%s`.', field, JSON.stringify(value)) : invariant(false) : undefined;
  return value;
}

module.exports = RelayProfiler.instrument('writeRelayUpdatePayload', writeRelayUpdatePayload);