/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordStore
 * @flow
 * @typechecks
 */

'use strict';

import type {GraphQL} from 'GraphQL';
var GraphQLMutatorConstants = require('GraphQLMutatorConstants');
var GraphQLRange = require('GraphQLRange');
var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');
var RelayConnectionInterface = require('RelayConnectionInterface');
import type {
  Call,
  ClientMutationID,
  DataID,
  FieldValue,
  NodeRangeMap,
  Record,
  Records,
  RootCallMap
} from 'RelayInternalTypes';
var RelayNodeInterface = require('RelayNodeInterface');
import type RelayQueryPath from 'RelayQueryPath';
import type {RecordState} from 'RelayRecordState';
var RelayRecordStatusMap = require('RelayRecordStatusMap');
import type {CacheWriter} from 'RelayTypes';

var forEachObject = require('forEachObject');
var invariant = require('invariant');
var warning = require('warning');

var {CURSOR, NODE} = RelayConnectionInterface;
var EMPTY = '';
var FILTER_CALLS = '__filterCalls__';
var FORCE_INDEX = '__forceIndex__';
var RANGE = '__range__';
var PATH = '__path__';
var {APPEND, PREPEND, REMOVE} = GraphQLMutatorConstants;

type EdgeData = {
  __dataID__: DataID;
  cursor: mixed;
  node: {
    __dataID__: DataID;
  };
};
type PageInfo = {[key: string]: mixed};
type RangeEdge = {
  edgeID: string;
  nodeID: ?string;
};
export type RangeInfo = {
  diffCalls: Array<GraphQL.Call>;
  filterCalls: Array<GraphQL.Call>;
  pageInfo: ?PageInfo;
  requestedEdges: Array<RangeEdge>;
};
type RangeOperation = 'append' | 'prepend' | 'remove';

type RecordCollection = {
  cachedRecords?: Records;
  queuedRecords?: Records;
  records: Records;
};

type RootCallMapCollection = {
  cachedRootCallMap?: RootCallMap;
  rootCallMap: RootCallMap;
};

/**
 * @internal
 *
 * `RelayRecordStore` is the central repository for all data fetched by the
 * client. Data is stored as a map of IDs to Records. Records are maps of
 * field names to values.
 *
 * TODO: #6584253 Mediate access to node/cached/queued data via RelayRecordStore
 */
class RelayRecordStore {
  _cacheWriter: ?CacheWriter;
  _cachedRecords: ?Records;
  _cachedRootCallMap: RootCallMap;
  _clientMutationID: ?ClientMutationID;
  _queuedRecords: ?Records;
  _records: Records;
  _nodeConnectionMap: NodeRangeMap;
  _rootCallMap: RootCallMap;
  _storage: Array<Records>;

  constructor(
    records: RecordCollection,
    rootCallMaps?: ?RootCallMapCollection,
    nodeConnectionMap?: ?NodeRangeMap,
    cacheWriter?: ?CacheWriter,
    clientMutationID?: ?ClientMutationID
  ) {
    this._cacheWriter = cacheWriter;
    this._cachedRecords = records.cachedRecords;
    this._cachedRootCallMap =
      (rootCallMaps && rootCallMaps.cachedRootCallMap) || {};
    this._clientMutationID = clientMutationID;
    this._queuedRecords = records.queuedRecords;
    this._nodeConnectionMap = nodeConnectionMap || {};
    this._records = records.records;
    this._rootCallMap = (rootCallMaps && rootCallMaps.rootCallMap) || {};
    this._storage = [];
    if (this._queuedRecords) {
      this._storage.push(this._queuedRecords);
    }
    if (this._records) {
      this._storage.push(this._records);
    }
    if (this._cachedRecords) {
      this._storage.push(this._cachedRecords);
    }
  }

  /**
   * Get the data ID associated with a storage key (and optionally an
   * identifying argument value) for a root query.
   */
  getDataID(
    storageKey: string,
    identifyingArgValue: ?string
  ): ?DataID {
    if (RelayNodeInterface.isNodeRootCall(storageKey)) {
      invariant(
        identifyingArgValue != null,
        'RelayRecordStore.getDataID(): Argument to `%s()` ' +
        'cannot be null or undefined.',
        storageKey
      );
      return identifyingArgValue;
    }
    if (identifyingArgValue == null) {
      identifyingArgValue = EMPTY;
    }
    if (this._rootCallMap.hasOwnProperty(storageKey) &&
        this._rootCallMap[storageKey].hasOwnProperty(identifyingArgValue)) {
      return this._rootCallMap[storageKey][identifyingArgValue];
    } else if (this._cachedRootCallMap.hasOwnProperty(storageKey)) {
      return this._cachedRootCallMap[storageKey][identifyingArgValue];
    }
  }

  /**
   * Associate a data ID with a storage key (and optionally an identifying
   * argument value) for a root query.
   */
  putDataID(
    storageKey: string,
    identifyingArgValue: ?string,
    dataID: DataID
  ): void {
    if (RelayNodeInterface.isNodeRootCall(storageKey)) {
      invariant(
        identifyingArgValue != null,
        'RelayRecordStore.putDataID(): Argument to `%s()` ' +
        'cannot be null or undefined.',
        storageKey
      );
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
  }

  /**
   * Returns the status of the record stored at `dataID`.
   */
  getRecordState(dataID: DataID): RecordState {
    var record = this._getRecord(dataID);
    if (record === null) {
      return 'NONEXISTENT';
    } else if (record === undefined) {
      return 'UNKNOWN';
    }
    return 'EXISTENT';
  }

  /**
   * Create an empty record at `dataID` if a record does not already exist.
   */
  putRecord(
    dataID: DataID,
    typeName: ?string,
    path?: RelayQueryPath
  ): void {
    var target = this._queuedRecords || this._records;
    var prevRecord = target[dataID];
    if (prevRecord) {
      if (target === this._queuedRecords) {
        this._setClientMutationID(prevRecord);
      }
      return;
    }
    var nextRecord: Record = ({
      __dataID__: dataID,
      __typename: typeName,
    }: $FixMe);
    if (target === this._queuedRecords) {
      this._setClientMutationID(nextRecord);
    }
    if (GraphQLStoreDataHandler.isClientID(dataID)) {
      invariant(
        path,
        'RelayRecordStore.putRecord(): Expected a path for non-refetchable ' +
        'record `%s`.',
        dataID
      );
      nextRecord[PATH] = path;
    }
    target[dataID] = nextRecord;
    var cacheWriter = this._cacheWriter;
    if (!this._queuedRecords && cacheWriter) {
      cacheWriter.writeField(dataID, '__dataID__', dataID, typeName);
      var cachedPath = nextRecord[PATH];
      if (cachedPath) {
        cacheWriter.writeField(dataID, '__path__', cachedPath, typeName);
      }
    }
  }

  /**
   * Returns the path to a non-refetchable record.
   */
  getPathToRecord(
    dataID: DataID
  ): ?RelayQueryPath {
    var path: ?RelayQueryPath = (this._getField(dataID, PATH): any);
    return path;
  }

  /**
   * Returns whether a given record is affected by an optimistic update.
   */
  hasOptimisticUpdate(dataID: DataID): boolean {
    dataID = GraphQLStoreRangeUtils.getCanonicalClientID(dataID);
    invariant(
      this._queuedRecords,
      'RelayRecordStore.hasOptimisticUpdate(): Optimistic updates require ' +
      'queued records.'
    );
    return this._queuedRecords.hasOwnProperty(dataID);
  }

  /**
   * Returns a list of client mutation IDs for queued mutations whose optimistic
   * updates are affecting the record corresponding the given dataID. Returns
   * null if the record isn't affected by any optimistic updates.
   */
  getClientMutationIDs(dataID: DataID): ?Array<ClientMutationID> {
    dataID = GraphQLStoreRangeUtils.getCanonicalClientID(dataID);
    invariant(
      this._queuedRecords,
      'RelayRecordStore.getClientMutationIDs(): Optimistic updates require ' +
      'queued records.'
    );
    var record = this._queuedRecords[dataID];
    return record ? record.__mutationIDs__ : null;
  }

  /**
   * Returns whether an error occurred during a mutation affecting the
   * given (queued) record.
   */
  hasMutationError(dataID: DataID): boolean {
    if (this._queuedRecords) {
      var record = this._queuedRecords[dataID];
      return !!(
        record && RelayRecordStatusMap.isErrorStatus(record.__status__)
      );
    }
    return false;
  }

  /**
   * Sets the mutation status of a queued record to the given value.
   */
  setMutationErrorStatus(dataID: DataID, hasError: boolean): void {
    invariant(
      this._queuedRecords,
      'RelayRecordStore.setMutationErrorStatus(): Can only set the ' +
      'mutation status of queued records.'
    );
    var record = this._queuedRecords[dataID];
    invariant(
      record,
      'RelayRecordStore.setMutationErrorStatus(): Expected record `%s` to ' +
      'exist before settings its mutation error status.',
      dataID
    );
    record.__status__ = RelayRecordStatusMap.setErrorStatus(
      record.__status__,
      hasError
    );
  }

  /**
   * Delete the record at `dataID`, setting its value to `null`.
   */
  deleteRecord(
    dataID: DataID
  ): void {
    var target = this._queuedRecords || this._records;
    target[dataID] = null;

    // Remove any links for this record
    if (!this._queuedRecords) {
      delete this._nodeConnectionMap[dataID];
      if (this._cacheWriter) {
        this._cacheWriter.writeNode(dataID, null);
      }
    }
  }

  getType(dataID: DataID): ?string {
    // `__typename` property is typed as `string`
    return (this._getField(dataID, '__typename'): any);
  }

  /**
   * Returns the value of the field for the given dataID.
   */
  getField(
    dataID: DataID,
    storageKey: string
  ): ?FieldValue {
    return this._getField(dataID, storageKey);
  }

  /**
   * Sets the value of a scalar field.
   */
  putField(
    dataID: DataID,
    storageKey: string,
    value: FieldValue
  ) {
    var record = this._getRecordForWrite(dataID);
    invariant(
      record,
      'RelayRecordStore.putField(): Expected record `%s` to exist before ' +
      'writing field `%s`.',
      dataID,
      storageKey
    );
    record[storageKey] = value;
    if (!this._queuedRecords && this._cacheWriter) {
      var typeName = record.__typename;
      this._cacheWriter.writeField(dataID, storageKey, value, typeName);
    }
  }

  /**
   * Clears the value of a field by setting it to null/undefined.
   */
  deleteField(
    dataID: DataID,
    storageKey: string
  ): void {
    var record = this._getRecordForWrite(dataID);
    invariant(
      record,
      'RelayRecordStore.deleteField(): Expected record `%s` to exist before ' +
      'deleting field `%s`.',
      dataID,
      storageKey
    );
    record[storageKey] = null;
    if (!this._queuedRecords && this._cacheWriter) {
      this._cacheWriter.writeField(dataID, storageKey, null);
    }
  }

  /**
   * Returns the Data ID of a linked record (eg the ID of the `address` record
   * in `actor{address}`).
   */
  getLinkedRecordID(
    dataID: DataID,
    storageKey: string
  ): ?DataID {
    var field = this._getField(dataID, storageKey);
    if (field == null) {
      return field;
    }
    invariant(
      typeof field === 'object' &&
        field !== null &&
        !Array.isArray(field),
      'RelayRecordStore.getLinkedRecordID(): Expected field `%s` for record ' +
      '`%s` to have a linked record.',
      storageKey,
      dataID
    );
    return field.__dataID__;
  }

  /**
   * Creates/updates a link between two records via the given field.
   */
  putLinkedRecordID(
    parentID: DataID,
    storageKey: string,
    recordID: DataID
  ): void {
    var parent = this._getRecordForWrite(parentID);
    invariant(
      parent,
      'RelayRecordStore.putLinkedRecordID(): Expected record `%s` to exist ' +
      'before linking to record `%s`.',
      parentID,
      recordID
    );
    var record = this._getRecord(recordID);
    invariant(
      record,
      'RelayRecordStore.putLinkedRecordID(): Expected record `%s` to exist ' +
      'before linking from record `%s`.',
      recordID,
      parentID
    );
    var fieldValue = {
      __dataID__: recordID,
    };
    parent[storageKey] = fieldValue;
    if (!this._queuedRecords && this._cacheWriter) {
      this._cacheWriter.writeField(parentID, storageKey, fieldValue);
    }
  }

  /**
   * Returns an array of Data ID for a plural linked field (eg the actor IDs of
   * the `likers` in `story{likers}`).
   */
  getLinkedRecordIDs(
    dataID: DataID,
    storageKey: string
  ): ?Array<DataID> {
    var field = this._getField(dataID, storageKey);
    if (field == null) {
      return field;
    }
    invariant(
      Array.isArray(field),
      'RelayRecordStore.getLinkedRecordIDs(): Expected field `%s` for ' +
      'record `%s` to have an array of linked records.',
      storageKey,
      dataID
    );
    return field.map((item, ii) => {
      invariant(
        typeof item === 'object' && item.__dataID__,
        'RelayRecordStore.getLinkedRecordIDs(): Expected element at index %s ' +
        'in field `%s` for record `%s` to be a linked record.',
        ii,
        storageKey,
        dataID
      );
      return item.__dataID__;
    });
  }

  /**
   * Creates/updates a one-to-many link between records via the given field.
   */
  putLinkedRecordIDs(
    parentID: DataID,
    storageKey: string,
    recordIDs: Array<DataID>
  ): void {
    var parent = this._getRecordForWrite(parentID);
    invariant(
      parent,
      'RelayRecordStore.putLinkedRecordIDs(): Expected record `%s` to exist ' +
      'before linking records.',
      parentID
    );
    var records = recordIDs.map(recordID => {
      var record = this._getRecord(recordID);
      invariant(
        record,
        'RelayRecordStore.putLinkedRecordIDs(): Expected record `%s` to ' +
        'exist before linking from `%s`.',
        recordID,
        parentID
      );
      return {
        __dataID__: recordID,
      };
    });
    parent[storageKey] = records;
    if (!this._queuedRecords && this._cacheWriter) {
      this._cacheWriter.writeField(parentID, storageKey, records);
    }
  }

  /**
   * Gets the connectionIDs for all the connections that contain the given
   * record as a `node`, or null if the record does not appear as a `node` in
   * any connection.
   */
  getConnectionIDsForRecord(
    dataID: DataID
  ): ?Array<DataID> {
    var connectionIDs = this._nodeConnectionMap[dataID];
    if (connectionIDs) {
      return Object.keys(connectionIDs);
    }
    return null;
  }

  /**
   * Gets the connectionIDs for all variations of calls for the given base
   * schema name (Ex: `posts.orderby(recent)` and `posts.orderby(likes)`).
   */
  getConnectionIDsForField(
    dataID: DataID,
    schemaName: string
  ): ?Array<DataID> {
    // ignore queued records because not all range fields may be present there
    var record = this._records[dataID];
    if (record == null) {
      return record;
    }
    var connectionIDs;
    forEachObject(record, (datum, key) => {
      if (datum && getFieldNameFromKey(key) === schemaName) {
        var dataID = datum.__dataID__;
        if (dataID) {
          connectionIDs = connectionIDs || [];
          connectionIDs.push(dataID);
        }
      }
    });
    return connectionIDs;
  }

  /**
   * Get the force index associated with the range at `connectionID`.
   */
  getRangeForceIndex(
    connectionID: DataID
  ): number {
    var forceIndex: ?number = (this._getField(connectionID, FORCE_INDEX): any);
    if (forceIndex === null) {
      return -1;
    }
    // __forceIndex__ can only be a number
    return forceIndex || 0;
  }

  /**
   * Get the condition calls that were used to fetch the given connection.
   * Ex: for a field `photos.orderby(recent)`, this would be
   * [{name: 'orderby', value: 'recent'}]
   */
  getRangeFilterCalls(
    connectionID: DataID
  ): ?Array<Call> {
    return (this._getField(connectionID, FILTER_CALLS): any);
  }

  /**
   * Returns range information for the given connection field:
   * - `requestedEdges`: any edges already fetched for the given `calls`.
   * - `diffCalls`: an array of calls describing the difference
   *   between the given `calls` and already fetched data. Includes conditional
   *   calls (`orderby`) and range/offset calls (`first`, `after`).
   * - `filterCalls`: the subset of `calls` that are condition calls
   *   (`orderby`).
   */
  getRangeMetadata(
    connectionID: ?DataID,
    calls: Array<Call>
  ): ?RangeInfo {
    if (connectionID == null) {
      return connectionID;
    }
    var range: ?GraphQLRange = (this._getField(connectionID, RANGE): any);
    if (range == null) {
      if (range === null) {
        warning(
          false,
          'RelayRecordStore.getRangeMetadata(): Expected range to exist if ' +
          '`edges` has been fetched.'
        );
      }
      return undefined;
    }
    var filterCalls = getFilterCalls(calls);
    // Edges can only be fetched if a range call (first/last/find) is given.
    // Otherwise return diffCalls/filterCalls with empty edges.
    if (calls.length === filterCalls.length) {
      return {
        diffCalls: calls,
        filterCalls,
        pageInfo: undefined,
        requestedEdges: [],
      };
    }
    // Convert ordered `{name,value}` objects to `GraphQL.Call`s
    // TODO: make GraphQLRange accept output of `getCallsWithValues()`
    var queuedRecord = this._queuedRecords ?
      (this._queuedRecords: $FixMe)[connectionID] :
      null;
    var {
      diffCalls,
      pageInfo,
      requestedEdgeIDs,
    } = range.retrieveRangeInfoForQuery(calls, queuedRecord);
    if (diffCalls && diffCalls.length) {
      diffCalls = filterCalls.concat(diffCalls);
    } else {
      diffCalls = [];
    }
    var requestedEdges;
    if (requestedEdgeIDs) {
      requestedEdges = requestedEdgeIDs
        .map(edgeID => ({
          edgeID,
          nodeID: this.getLinkedRecordID(edgeID, NODE),
        }))
        .filter(edge => this._getRecord(edge.nodeID));
    } else {
      requestedEdges = [];
    }
    return {
      diffCalls,
      filterCalls,
      pageInfo,
      requestedEdges,
    };
  }

  /**
   * Creates a range at `dataID` with an optional `forceIndex`.
   */
  putRange(
    connectionID: DataID,
    calls: Array<Call>,
    forceIndex?: ?number
  ): void {
    invariant(
      !this._queuedRecords,
      'RelayRecordStore.putRange(): Cannot create a queued range.'
    );
    var record = this._getRecord(connectionID);
    invariant(
      record,
      'RelayRecordStore.putRange(): Expected record `%s` to exist before ' +
      'adding a range.',
      connectionID
    );
    var range = new GraphQLRange();
    var filterCalls = getFilterCalls(calls);
    forceIndex = forceIndex || 0;
    record.__filterCalls__ = filterCalls;
    record.__forceIndex__ = forceIndex;
    record.__range__ = range;

    var cacheWriter = this._cacheWriter;
    if (!this._queuedRecords && cacheWriter) {
      cacheWriter.writeField(connectionID, FILTER_CALLS, filterCalls);
      cacheWriter.writeField(connectionID, FORCE_INDEX, forceIndex);
      cacheWriter.writeField(connectionID, RANGE, range);
    }
  }

  /**
   * Returns whether there is a range at `connectionID`.
   */
  hasRange(connectionID: DataID): boolean {
    return !!this._getField(connectionID, RANGE);
  }

  /**
   * Adds newly fetched edges to a range.
   */
  putRangeEdges(
    connectionID: DataID,
    calls: Array<Call>,
    pageInfo: PageInfo,
    edges: Array<DataID>
  ): void {
    var range: ?GraphQLRange = (this._getField(connectionID, RANGE): any);
    invariant(
      range,
      'RelayRecordStore.putRangeEdges(): Expected record `%s` to exist and ' +
      'have a range.',
      connectionID
    );
    var edgesData = [];
    edges.forEach(edgeID => {
      var edgeData = this._getRangeEdgeData(edgeID);
      edgesData.push(edgeData);
      this._addConnectionForNode(connectionID, edgeData.node.__dataID__);
    });
    range.addItems(
      calls,
      edgesData,
      pageInfo
    );
    if (!this._queuedRecords && this._cacheWriter) {
      this._cacheWriter.writeField(connectionID, RANGE, range);
    }
  }

  /**
   * Prepend, append, or delete edges to/from a range.
   */
  applyRangeUpdate(
    connectionID: DataID,
    edgeID: DataID,
    operation: RangeOperation
  ): void {
    if (this._queuedRecords) {
      this._applyOptimisticRangeUpdate(connectionID, edgeID, operation);
    } else {
      this._applyServerRangeUpdate(connectionID, edgeID, operation);
    }
  }

  /**
   * Completely removes the record identified by `dataID` from the store
   */
  removeRecord(dataID: DataID): void {
    delete this._records[dataID];
    if (this._queuedRecords) {
      delete this._queuedRecords[dataID];
    }
    if (this._cachedRecords) {
      delete this._cachedRecords[dataID];
    }
  }

  /**
   * Get edge data in a format compatibile with `GraphQLRange`.
   * TODO: change `GraphQLRange` to accept `(edgeID, cursor, nodeID)` tuple
   */
  _getRangeEdgeData(edgeID: DataID): EdgeData {
    var nodeID = this.getLinkedRecordID(edgeID, NODE);
    invariant(
      nodeID,
      'RelayRecordStore: Expected edge `%s` to have a `node` record.',
      edgeID
    );
    return {
      __dataID__: edgeID,
      cursor: this.getField(edgeID, CURSOR),
      node: {
        __dataID__: nodeID,
      },
    };
  }

  _applyOptimisticRangeUpdate(
    connectionID: DataID,
    edgeID: DataID,
    operation: RangeOperation
  ): void {
    invariant(
      this._queuedRecords,
      'RelayRecordStore: Expected queued records to exist for optimistic ' +
      '`%s` update to record `%s`.',
      operation,
      connectionID
    );
    var record: ?Record = this._queuedRecords[connectionID];
    if (!record) {
      // $FlowIssue: this fails with:
      // "property `append/prepend/remove` not found in object literal"
      record = ({__dataID__: connectionID}: $FlowIssue);
      this._queuedRecords[connectionID] = record;
    }
    this._setClientMutationID(record);
    var queue: ?Array<DataID> = (record[operation]: any);
    if (!queue) {
      queue = [];
      record[operation] = queue;
    }
    if (operation === PREPEND) {
      queue.unshift(edgeID);
    } else {
      queue.push(edgeID);
    }
  }

  _applyServerRangeUpdate(
    connectionID: DataID,
    edgeID: DataID,
    operation: RangeOperation
  ): void {
    invariant(
      this._records,
      'RelayRecordStore: Expected base records to exist for `%s` update to ' +
      'record `%s`.',
      operation,
      connectionID
    );
    var range: ?GraphQLRange = (this._getField(connectionID, RANGE): any);
    invariant(
      range,
      'RelayRecordStore: Cannot apply `%s` update to non-existent record `%s`.',
      operation,
      connectionID
    );
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
  }

  /**
   * Record that the node is contained in the connection.
   */
  _addConnectionForNode(
    connectionID: DataID,
    nodeID: DataID
  ): void {
    var connectionMap = this._nodeConnectionMap[nodeID];
    if (!connectionMap) {
      connectionMap = {};
      this._nodeConnectionMap[nodeID] = connectionMap;
    }
    connectionMap[connectionID] = true;
  }

  /**
   * Record that the given node is no longer part of the connection.
   */
  _removeConnectionForNode(
    connectionID: DataID,
    nodeID: DataID
  ): void {
    var connectionMap = this._nodeConnectionMap[nodeID];
    if (connectionMap) {
      delete connectionMap[connectionID];
      if (Object.keys(connectionMap).length === 0) {
        delete this._nodeConnectionMap[nodeID];
      }
    }
  }

  /**
   * Gets the first version of the record from the available caches.
   */
  _getRecord(dataID: DataID): ?Record {
    if (this._queuedRecords && this._queuedRecords.hasOwnProperty(dataID)) {
      return this._queuedRecords[dataID];
    } else if (this._records.hasOwnProperty(dataID)) {
      return this._records[dataID];
    } else if (this._cachedRecords) {
      return this._cachedRecords[dataID];
    }
  }

  /**
   * If the record is in the store, gets or creates a version of the record
   * in the store being used for writes.
   */
  _getRecordForWrite(dataID: DataID): ?Record {
    // Cannot write to non-existent records, so ensure the record exists first.
    // Returning null/undefined allows for local invariant checks at call sites
    // with specific error messaging.
    var record = this._getRecord(dataID);
    if (!record) {
      return record;
    }
    // Create an empty version of the record in the writable store if it does
    // not already exist there.
    var source = this._queuedRecords || this._records;
    if (!source[dataID]) {
      record = source[dataID] = ({
        __dataID__: dataID,
      }: $FixMe);
    }
    if (source === this._queuedRecords) {
      this._setClientMutationID(record);
    }
    return record;
  }

  /**
   * Get the value of the field from the first version of the record for which
   * the field is defined, returning `null` if the record has been deleted or
   * `undefined` if the record has not been fetched.
   */
  _getField(dataID: DataID, storageKey: string): ?FieldValue {
    var storage = this._storage;
    for (var ii = 0; ii < storage.length; ii++) {
      var record = storage[ii][dataID];
      if (record === null) {
        return null;
      } else if (record && record.hasOwnProperty(storageKey)) {
        return record[storageKey];
      }
    }
    return undefined;
  }

  /**
   * Injects the client mutation id associated with the record store instance
   * into the given record.
   */
  _setClientMutationID(record: Record): void {
    var clientMutationID = this._clientMutationID;
    invariant(
      clientMutationID,
      'RelayRecordStore: _clientMutationID cannot be null/undefined.'
    );
    var mutationIDs: Array<ClientMutationID> = record.__mutationIDs__ || [];
    if (mutationIDs.indexOf(clientMutationID) === -1) {
      mutationIDs.push(clientMutationID);
      record.__mutationIDs__ = mutationIDs;
    }
    record.__status__ = RelayRecordStatusMap.setOptimisticStatus(
      0,
      true
    );
  }
}

/**
 * Filter calls to only those that specify conditions on the returned results
 * (ex: `orderby(TOP_STORIES)`), removing generic calls (ex: `first`, `find`).
 */
function getFilterCalls(calls: Array<Call>): Array<Call> {
  return calls.filter(call => !RelayConnectionInterface.isConnectionCall(call));
}

/**
 * Returns the field name based on the object key used to store the data in
 * nodeData. It returns the field name without any calls. For example, the
 * field name for 'profile_picture.size(50)' will be 'profile_picture'
 */
function getFieldNameFromKey(key: string): string {
  return (key.split('.')[0]: any);
}

module.exports = RelayRecordStore;
