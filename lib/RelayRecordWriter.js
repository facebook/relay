/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordWriter
 * 
 * @typechecks
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var GraphQLMutatorConstants = require('./GraphQLMutatorConstants');
var GraphQLRange = require('./GraphQLRange');
var RelayConnectionInterface = require('./RelayConnectionInterface');

var RelayNodeInterface = require('./RelayNodeInterface');

var RelayRecord = require('./RelayRecord');

var RelayRecordStatusMap = require('./RelayRecordStatusMap');

var invariant = require('fbjs/lib/invariant');
var rangeOperationToMetadataKey = require('./rangeOperationToMetadataKey');

var CURSOR = RelayConnectionInterface.CURSOR;
var NODE = RelayConnectionInterface.NODE;

var EMPTY = '';
var FILTER_CALLS = '__filterCalls__';
var FORCE_INDEX = '__forceIndex__';
var RANGE = '__range__';
var RESOLVED_FRAGMENT_MAP = '__resolvedFragmentMap__';
var RESOLVED_FRAGMENT_MAP_GENERATION = '__resolvedFragmentMapGeneration__';
var PATH = '__path__';
var APPEND = GraphQLMutatorConstants.APPEND;
var PREPEND = GraphQLMutatorConstants.PREPEND;
var REMOVE = GraphQLMutatorConstants.REMOVE;

/**
 * @internal
 *
 * `RelayRecordWriter` is the helper module to write data into RelayRecordStore.
 */

var RelayRecordWriter = (function () {
  function RelayRecordWriter(records, rootCallMap, isOptimistic, nodeConnectionMap, cacheWriter, clientMutationID) {
    _classCallCheck(this, RelayRecordWriter);

    this._cacheWriter = cacheWriter;
    this._clientMutationID = clientMutationID;
    this._isOptimisticWrite = isOptimistic;
    this._nodeConnectionMap = nodeConnectionMap || {};
    this._records = records;
    this._rootCallMap = rootCallMap;
  }

  /**
   * Filter calls to only those that specify conditions on the returned results
   * (ex: `orderby(TOP_STORIES)`), removing generic calls (ex: `first`, `find`).
   */

  /**
   * Get the data ID associated with a storage key (and optionally an
   * identifying argument value) for a root query.
   */

  RelayRecordWriter.prototype.getDataID = function getDataID(storageKey, identifyingArgValue) {
    if (RelayNodeInterface.isNodeRootCall(storageKey)) {
      !(identifyingArgValue != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.getDataID(): Argument to `%s()` ' + 'cannot be null or undefined.', storageKey) : invariant(false) : undefined;
      return identifyingArgValue;
    }
    if (identifyingArgValue == null) {
      identifyingArgValue = EMPTY;
    }
    if (this._rootCallMap.hasOwnProperty(storageKey) && this._rootCallMap[storageKey].hasOwnProperty(identifyingArgValue)) {
      return this._rootCallMap[storageKey][identifyingArgValue];
    }
  };

  /**
   * Associate a data ID with a storage key (and optionally an identifying
   * argument value) for a root query.
   */

  RelayRecordWriter.prototype.putDataID = function putDataID(storageKey, identifyingArgValue, dataID) {
    if (RelayNodeInterface.isNodeRootCall(storageKey)) {
      !(identifyingArgValue != null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putDataID(): Argument to `%s()` ' + 'cannot be null or undefined.', storageKey) : invariant(false) : undefined;
      return;
    }
    if (identifyingArgValue == null) {
      identifyingArgValue = EMPTY;
    }
    this._rootCallMap[storageKey] = this._rootCallMap[storageKey] || {};
    this._rootCallMap[storageKey][identifyingArgValue] = dataID;
    if (this._cacheWriter) {
      this._cacheWriter.writeRootCall(storageKey, identifyingArgValue, dataID);
    }
  };

  /**
   * Returns the status of the record stored at `dataID`.
   */

  RelayRecordWriter.prototype.getRecordState = function getRecordState(dataID) {
    var record = this._records[dataID];
    if (record === null) {
      return 'NONEXISTENT';
    } else if (record === undefined) {
      return 'UNKNOWN';
    }
    return 'EXISTENT';
  };

  /**
   * Create an empty record at `dataID` if a record does not already exist.
   */

  RelayRecordWriter.prototype.putRecord = function putRecord(dataID, typeName, path) {
    var prevRecord = this._getRecordForWrite(dataID);
    if (prevRecord) {
      return;
    }
    var nextRecord = RelayRecord.createWithFields(dataID, {
      __typename: typeName
    });
    if (this._isOptimisticWrite) {
      this._setClientMutationID(nextRecord);
    }
    if (RelayRecord.isClientID(dataID)) {
      !path ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putRecord(): Expected a path for non-refetchable ' + 'record `%s`.', dataID) : invariant(false) : undefined;
      nextRecord[PATH] = path;
    }
    this._records[dataID] = nextRecord;
    var cacheWriter = this._cacheWriter;
    if (!this._isOptimisticWrite && cacheWriter) {
      cacheWriter.writeField(dataID, '__dataID__', dataID, typeName);
    }
  };

  /**
   * Returns the path to a non-refetchable record.
   */

  RelayRecordWriter.prototype.getPathToRecord = function getPathToRecord(dataID) {
    return this._getField(dataID, PATH);
  };

  /**
   * Check whether a given record has received data for a deferred fragment.
   */

  RelayRecordWriter.prototype.hasDeferredFragmentData = function hasDeferredFragmentData(dataID, fragmentID) {
    var resolvedFragmentMap = this._getField(dataID, RESOLVED_FRAGMENT_MAP);
    !(typeof resolvedFragmentMap === 'object' || resolvedFragmentMap == null) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.hasDeferredFragmentData(): Expected the map of ' + 'resolved deferred fragments associated with record `%s` to be null or ' + 'an object. Found a(n) `%s`.', dataID, typeof resolvedFragmentMap) : invariant(false) : undefined;
    return !!(resolvedFragmentMap && resolvedFragmentMap[fragmentID]);
  };

  /**
   * Mark a given record as having received data for a deferred fragment.
   */

  RelayRecordWriter.prototype.setHasDeferredFragmentData = function setHasDeferredFragmentData(dataID, fragmentID) {
    var record = this._getRecordForWrite(dataID);
    !record ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.setHasDeferredFragmentData(): Expected record `%s` ' + 'to exist before marking it as having received data for the deferred ' + 'fragment with id `%s`.', dataID, fragmentID) : invariant(false) : undefined;
    var resolvedFragmentMap = record[RESOLVED_FRAGMENT_MAP];
    if (typeof resolvedFragmentMap !== 'object' || !resolvedFragmentMap) {
      resolvedFragmentMap = {};
    }
    resolvedFragmentMap[fragmentID] = true;
    record[RESOLVED_FRAGMENT_MAP] = resolvedFragmentMap;
    if (typeof record[RESOLVED_FRAGMENT_MAP_GENERATION] === 'number') {
      record[RESOLVED_FRAGMENT_MAP_GENERATION]++;
    } else {
      record[RESOLVED_FRAGMENT_MAP_GENERATION] = 0;
    }
  };

  /**
   * Delete the record at `dataID`, setting its value to `null`.
   */

  RelayRecordWriter.prototype.deleteRecord = function deleteRecord(dataID) {
    this._records[dataID] = null;

    // Remove any links for this record
    if (!this._isOptimisticWrite) {
      delete this._nodeConnectionMap[dataID];
      if (this._cacheWriter) {
        this._cacheWriter.writeNode(dataID, null);
      }
    }
  };

  RelayRecordWriter.prototype.getType = function getType(dataID) {
    // `__typename` property is typed as `string`
    return this._getField(dataID, '__typename');
  };

  /**
   * Returns the value of the field for the given dataID.
   */

  RelayRecordWriter.prototype.getField = function getField(dataID, storageKey) {
    return this._getField(dataID, storageKey);
  };

  /**
   * Sets the value of a scalar field.
   */

  RelayRecordWriter.prototype.putField = function putField(dataID, storageKey, value) {
    var record = this._getRecordForWrite(dataID);
    !record ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putField(): Expected record `%s` to exist before ' + 'writing field `%s`.', dataID, storageKey) : invariant(false) : undefined;
    record[storageKey] = value;
    if (!this._isOptimisticWrite && this._cacheWriter) {
      var typeName = record.__typename;
      this._cacheWriter.writeField(dataID, storageKey, value, typeName);
    }
  };

  /**
   * Clears the value of a field by setting it to null/undefined.
   */

  RelayRecordWriter.prototype.deleteField = function deleteField(dataID, storageKey) {
    var record = this._getRecordForWrite(dataID);
    !record ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.deleteField(): Expected record `%s` to exist before ' + 'deleting field `%s`.', dataID, storageKey) : invariant(false) : undefined;
    record[storageKey] = null;
    if (!this._isOptimisticWrite && this._cacheWriter) {
      this._cacheWriter.writeField(dataID, storageKey, null);
    }
  };

  /**
   * Returns the Data ID of a linked record (eg the ID of the `address` record
   * in `actor{address}`).
   */

  RelayRecordWriter.prototype.getLinkedRecordID = function getLinkedRecordID(dataID, storageKey) {
    var field = this._getField(dataID, storageKey);
    if (field == null) {
      return field;
    }
    !(typeof field === 'object' && field !== null && !Array.isArray(field)) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.getLinkedRecordID(): Expected field `%s` for record ' + '`%s` to have a linked record.', storageKey, dataID) : invariant(false) : undefined;
    return field.__dataID__;
  };

  /**
   * Creates/updates a link between two records via the given field.
   */

  RelayRecordWriter.prototype.putLinkedRecordID = function putLinkedRecordID(parentID, storageKey, recordID) {
    var parent = this._getRecordForWrite(parentID);
    !parent ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putLinkedRecordID(): Expected record `%s` to exist ' + 'before linking to record `%s`.', parentID, recordID) : invariant(false) : undefined;
    var record = this._records[recordID];
    !record ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putLinkedRecordID(): Expected record `%s` to exist ' + 'before linking from record `%s`.', recordID, parentID) : invariant(false) : undefined;
    var fieldValue = RelayRecord.create(recordID);
    parent[storageKey] = fieldValue;
    if (!this._isOptimisticWrite && this._cacheWriter) {
      this._cacheWriter.writeField(parentID, storageKey, fieldValue);
    }
  };

  /**
   * Returns an array of Data ID for a plural linked field (eg the actor IDs of
   * the `likers` in `story{likers}`).
   */

  RelayRecordWriter.prototype.getLinkedRecordIDs = function getLinkedRecordIDs(dataID, storageKey) {
    var field = this._getField(dataID, storageKey);
    if (field == null) {
      return field;
    }
    !Array.isArray(field) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.getLinkedRecordIDs(): Expected field `%s` for ' + 'record `%s` to have an array of linked records.', storageKey, dataID) : invariant(false) : undefined;
    return field.map(function (item, ii) {
      !(typeof item === 'object' && item.__dataID__) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.getLinkedRecordIDs(): Expected element at index ' + '%s in field `%s` for record `%s` to be a linked record.', ii, storageKey, dataID) : invariant(false) : undefined;
      return item.__dataID__;
    });
  };

  /**
   * Creates/updates a one-to-many link between records via the given field.
   */

  RelayRecordWriter.prototype.putLinkedRecordIDs = function putLinkedRecordIDs(parentID, storageKey, recordIDs) {
    var _this = this;

    var parent = this._getRecordForWrite(parentID);
    !parent ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putLinkedRecordIDs(): Expected record `%s` to exist ' + 'before linking records.', parentID) : invariant(false) : undefined;
    var records = recordIDs.map(function (recordID) {
      var record = _this._records[recordID];
      !record ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putLinkedRecordIDs(): Expected record `%s` to ' + 'exist before linking from `%s`.', recordID, parentID) : invariant(false) : undefined;
      return RelayRecord.create(recordID);
    });
    parent[storageKey] = records;
    if (!this._isOptimisticWrite && this._cacheWriter) {
      this._cacheWriter.writeField(parentID, storageKey, records);
    }
  };

  /**
   * Get the force index associated with the range at `connectionID`.
   */

  RelayRecordWriter.prototype.getRangeForceIndex = function getRangeForceIndex(connectionID) {
    var forceIndex = this._getField(connectionID, FORCE_INDEX);
    if (forceIndex === null) {
      return -1;
    }
    // __forceIndex__ can only be a number
    return forceIndex || 0;
  };

  /**
   * Get the condition calls that were used to fetch the given connection.
   * Ex: for a field `photos.orderby(recent)`, this would be
   * [{name: 'orderby', value: 'recent'}]
   */

  RelayRecordWriter.prototype.getRangeFilterCalls = function getRangeFilterCalls(connectionID) {
    return this._getField(connectionID, FILTER_CALLS);
  };

  /**
   * Creates a range at `dataID` with an optional `forceIndex`.
   */

  RelayRecordWriter.prototype.putRange = function putRange(connectionID, calls, forceIndex) {
    !!this._isOptimisticWrite ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putRange(): Cannot create a queued range.') : invariant(false) : undefined;
    var record = this._getRecordForWrite(connectionID);
    !record ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putRange(): Expected record `%s` to exist before ' + 'adding a range.', connectionID) : invariant(false) : undefined;
    var range = new GraphQLRange();
    var filterCalls = getFilterCalls(calls);
    forceIndex = forceIndex || 0;
    record.__filterCalls__ = filterCalls;
    record.__forceIndex__ = forceIndex;
    record.__range__ = range;

    var cacheWriter = this._cacheWriter;
    if (!this._isOptimisticWrite && cacheWriter) {
      cacheWriter.writeField(connectionID, FILTER_CALLS, filterCalls);
      cacheWriter.writeField(connectionID, FORCE_INDEX, forceIndex);
      cacheWriter.writeField(connectionID, RANGE, range);
    }
  };

  /**
   * Returns whether there is a range at `connectionID`.
   */

  RelayRecordWriter.prototype.hasRange = function hasRange(connectionID) {
    return !!this._getField(connectionID, RANGE);
  };

  /**
   * Adds newly fetched edges to a range.
   */

  RelayRecordWriter.prototype.putRangeEdges = function putRangeEdges(connectionID, calls, pageInfo, edges) {
    var _this2 = this;

    var range = this._getField(connectionID, RANGE);
    !range ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter.putRangeEdges(): Expected record `%s` to exist and ' + 'have a range.', connectionID) : invariant(false) : undefined;
    var edgesData = [];
    edges.forEach(function (edgeID) {
      var edgeData = _this2._getRangeEdgeData(edgeID);
      edgesData.push(edgeData);
      _this2._addConnectionForNode(connectionID, edgeData.node.__dataID__);
    });
    range.addItems(calls, edgesData, pageInfo);
    if (!this._isOptimisticWrite && this._cacheWriter) {
      this._cacheWriter.writeField(connectionID, RANGE, range);
    }
  };

  /**
   * Prepend, append, or delete edges to/from a range.
   */

  RelayRecordWriter.prototype.applyRangeUpdate = function applyRangeUpdate(connectionID, edgeID, operation) {
    if (this._isOptimisticWrite) {
      this._applyOptimisticRangeUpdate(connectionID, edgeID, operation);
    } else {
      this._applyServerRangeUpdate(connectionID, edgeID, operation);
    }
  };

  /**
   * Get edge data in a format compatibile with `GraphQLRange`.
   * TODO: change `GraphQLRange` to accept `(edgeID, cursor, nodeID)` tuple
   */

  RelayRecordWriter.prototype._getRangeEdgeData = function _getRangeEdgeData(edgeID) {
    var nodeID = this.getLinkedRecordID(edgeID, NODE);
    !nodeID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter: Expected edge `%s` to have a `node` record.', edgeID) : invariant(false) : undefined;
    return RelayRecord.createWithFields(edgeID, {
      cursor: this.getField(edgeID, CURSOR),
      node: RelayRecord.create(nodeID)
    });
  };

  RelayRecordWriter.prototype._applyOptimisticRangeUpdate = function _applyOptimisticRangeUpdate(connectionID, edgeID, operation) {
    var record = this._getRecordForWrite(connectionID);
    if (!record) {
      record = RelayRecord.create(connectionID);
      this._records[connectionID] = record;
    }
    this._setClientMutationID(record);
    var key = rangeOperationToMetadataKey[operation];
    var queue = record[key];
    if (!queue) {
      queue = [];
      record[key] = queue;
    }
    if (operation === PREPEND) {
      queue.unshift(edgeID);
    } else {
      queue.push(edgeID);
    }
  };

  RelayRecordWriter.prototype._applyServerRangeUpdate = function _applyServerRangeUpdate(connectionID, edgeID, operation) {
    var range = this._getField(connectionID, RANGE);
    !range ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter: Cannot apply `%s` update to non-existent record ' + '`%s`.', operation, connectionID) : invariant(false) : undefined;
    if (operation === REMOVE) {
      range.removeEdgeWithID(edgeID);
      var nodeID = this.getLinkedRecordID(edgeID, 'node');
      if (nodeID) {
        this._removeConnectionForNode(connectionID, nodeID);
      }
    } else {
      var edgeData = this._getRangeEdgeData(edgeID);
      this._addConnectionForNode(connectionID, edgeData.node.__dataID__);
      if (operation === APPEND) {
        range.appendEdge(this._getRangeEdgeData(edgeID));
      } else {
        // prepend
        range.prependEdge(this._getRangeEdgeData(edgeID));
      }
    }
    if (this._cacheWriter) {
      this._cacheWriter.writeField(connectionID, RANGE, range);
    }
  };

  /**
   * Record that the node is contained in the connection.
   */

  RelayRecordWriter.prototype._addConnectionForNode = function _addConnectionForNode(connectionID, nodeID) {
    var connectionMap = this._nodeConnectionMap[nodeID];
    if (!connectionMap) {
      connectionMap = {};
      this._nodeConnectionMap[nodeID] = connectionMap;
    }
    connectionMap[connectionID] = true;
  };

  /**
   * Record that the given node is no longer part of the connection.
   */

  RelayRecordWriter.prototype._removeConnectionForNode = function _removeConnectionForNode(connectionID, nodeID) {
    var connectionMap = this._nodeConnectionMap[nodeID];
    if (connectionMap) {
      delete connectionMap[connectionID];
      if (_Object$keys(connectionMap).length === 0) {
        delete this._nodeConnectionMap[nodeID];
      }
    }
  };

  /**
   * If the record is in the store, gets a version of the record
   * in the store being used for writes.
   */

  RelayRecordWriter.prototype._getRecordForWrite = function _getRecordForWrite(dataID) {
    var record = this._records[dataID];
    if (!record) {
      return record;
    }
    if (this._isOptimisticWrite) {
      this._setClientMutationID(record);
    }
    return record;
  };

  /**
   * Get the value of the field from the first version of the record for which
   * the field is defined, returning `null` if the record has been deleted or
   * `undefined` if the record has not been fetched.
   */

  RelayRecordWriter.prototype._getField = function _getField(dataID, storageKey) {
    var record = this._records[dataID];
    if (record === null) {
      return null;
    } else if (record && record.hasOwnProperty(storageKey)) {
      return record[storageKey];
    } else {
      return undefined;
    }
  };

  /**
   * Injects the client mutation id associated with the record store instance
   * into the given record.
   */

  RelayRecordWriter.prototype._setClientMutationID = function _setClientMutationID(record) {
    var clientMutationID = this._clientMutationID;
    !clientMutationID ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayRecordWriter: _clientMutationID cannot be null/undefined.') : invariant(false) : undefined;
    var mutationIDs = record.__mutationIDs__ || [];
    if (mutationIDs.indexOf(clientMutationID) === -1) {
      mutationIDs.push(clientMutationID);
      record.__mutationIDs__ = mutationIDs;
    }
    record.__status__ = RelayRecordStatusMap.setOptimisticStatus(0, true);
  };

  return RelayRecordWriter;
})();

function getFilterCalls(calls) {
  return calls.filter(function (call) {
    return !RelayConnectionInterface.isConnectionCall(call);
  });
}

module.exports = RelayRecordWriter;