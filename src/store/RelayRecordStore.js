/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

const GraphQLRange = require('GraphQLRange');
const RelayConnectionInterface = require('RelayConnectionInterface');
import type {PageInfo} from 'RelayConnectionInterface';
import type {
  Call,
  ClientMutationID,
  DataID,
  FieldValue,
  NodeRangeMap,
  RootCallMap,
} from 'RelayInternalTypes';
const RelayNodeInterface = require('RelayNodeInterface');
import type {QueryPath} from 'RelayQueryPath';
const RelayRecord = require('RelayRecord');
import type {
  Record,
  RecordMap,
} from 'RelayRecord';
import type {RecordState} from 'RelayRecordState';

const forEachObject = require('forEachObject');
const invariant = require('invariant');
const warning = require('warning');

type RangeEdge = {
  edgeID: string;
  nodeID: ?string;
};

export type RangeInfo = {
  diffCalls: Array<Call>;
  filterCalls: Array<Call>;
  pageInfo: ?PageInfo;
  requestedEdgeIDs: Array<string>;
  filteredEdges: Array<RangeEdge>;
};

type RecordCollection = {
  cachedRecords?: ?RecordMap;
  queuedRecords?: ?RecordMap;
  records: RecordMap;
};

type RootCallMapCollection = {
  cachedRootCallMap?: RootCallMap;
  rootCallMap: RootCallMap;
};

const EMPTY = '';
const {NODE} = RelayConnectionInterface;
const {
  FILTER_CALLS,
  FORCE_INDEX,
  MUTATION_IDS,
  PATH,
  RANGE,
  RESOLVED_FRAGMENT_MAP,
} = RelayRecord.MetadataKey;

/**
 * @internal
 *
 * `RelayRecordStore` is the central repository for all data fetched by the
 * client. Data is stored as a map from IDs to Records. Records are shapes of
 * data with globally unique "data IDs".
 */
class RelayRecordStore {
  _cachedRecords: ?RecordMap;
  _cachedRootCallMap: RootCallMap;
  _queuedRecords: ?RecordMap;
  _nodeConnectionMap: NodeRangeMap;
  _records: RecordMap;
  _rootCallMap: RootCallMap;
  _storage: Array<RecordMap>;

  constructor(
    records: RecordCollection,
    rootCallMaps?: ?RootCallMapCollection,
    nodeConnectionMap?: ?NodeRangeMap,
  ) {
    this._cachedRecords = records.cachedRecords;
    this._cachedRootCallMap =
      (rootCallMaps && rootCallMaps.cachedRootCallMap) || {};
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
   * Returns the status of the record stored at `dataID`.
   */
  getRecordState(dataID: DataID): RecordState {
    const record = this._getRecord(dataID);
    if (record === null) {
      return 'NONEXISTENT';
    } else if (record === undefined) {
      return 'UNKNOWN';
    }
    return 'EXISTENT';
  }

  /**
   * Returns the path to a non-refetchable record.
   */
  getPathToRecord(
    dataID: DataID
  ): ?QueryPath {
    const path: ?QueryPath = (this._getField(dataID, PATH): any);
    return path;
  }

  /**
   * Returns whether a given record is affected by an optimistic update.
   */
  hasOptimisticUpdate(dataID: DataID): boolean {
    const queuedRecords = this._queuedRecords;
    return queuedRecords ?
      queuedRecords.hasOwnProperty(dataID) :
      false;
  }

  /**
   * Returns a list of client mutation IDs for queued mutations whose optimistic
   * updates are affecting the record corresponding the given dataID. Returns
   * null if the record isn't affected by any optimistic updates.
   */
  getClientMutationIDs(dataID: DataID): ?Array<ClientMutationID> {
    const queuedRecords = this._queuedRecords;
    if (queuedRecords) {
      const record = queuedRecords[dataID];
      if (record) {
        return record[MUTATION_IDS];
      }
    }
    return null;
  }

  /**
   * Check whether a given record has received data for a deferred fragment.
   */
  hasDeferredFragmentData(dataID: DataID, fragmentID: string): boolean {
    const resolvedFragmentMap = this._getField(dataID, RESOLVED_FRAGMENT_MAP);
    invariant(
      typeof resolvedFragmentMap === 'object' || resolvedFragmentMap == null,
      'RelayRecordStore.hasDeferredFragmentData(): Expected the map of ' +
      'resolved deferred fragments associated with record `%s` to be null or ' +
      'an object. Found a(n) `%s`.',
      dataID,
      typeof resolvedFragmentMap
    );
    return !!(resolvedFragmentMap && resolvedFragmentMap[fragmentID]);
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
   * Returns the Data ID of a linked record (eg the ID of the `address` record
   * in `actor{address}`).
   */
  getLinkedRecordID(
    dataID: DataID,
    storageKey: string
  ): ?DataID {
    const field = this._getField(dataID, storageKey);
    if (field == null) {
      return field;
    }
    const record = RelayRecord.getRecord(field);
    invariant(
      record,
      'RelayRecordStore.getLinkedRecordID(): Expected field `%s` for record ' +
      '`%s` to have a linked record.',
      storageKey,
      dataID
    );
    return RelayRecord.getDataID(record);
  }

  /**
   * Returns an array of Data ID for a plural linked field (eg the actor IDs of
   * the `likers` in `story{likers}`).
   */
  getLinkedRecordIDs(
    dataID: DataID,
    storageKey: string
  ): ?Array<DataID> {
    const field = this._getField(dataID, storageKey);
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
    return field.map((element, ii) => {
      const record = RelayRecord.getRecord(element);
      invariant(
        record,
        'RelayRecordStore.getLinkedRecordIDs(): Expected element at index %s ' +
        'in field `%s` for record `%s` to be a linked record.',
        ii,
        storageKey,
        dataID
      );
      return RelayRecord.getDataID(record);
    });
  }

  /**
   * Gets the connectionIDs for all the connections that contain the given
   * record as a `node`, or null if the record does not appear as a `node` in
   * any connection.
   */
  getConnectionIDsForRecord(
    dataID: DataID
  ): ?Array<DataID> {
    const connectionIDs = this._nodeConnectionMap[dataID];
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
    const record = this._records[dataID];
    if (record == null) {
      return record;
    }
    let connectionIDs;
    forEachObject(record, (datum, key) => {
      if (datum && getFieldNameFromKey(key) === schemaName) {
        const connectionID = RelayRecord.getDataIDForObject(datum);
        if (connectionID) {
          connectionIDs = connectionIDs || [];
          connectionIDs.push(connectionID);
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
    const forceIndex: ?number = (this._getField(connectionID, FORCE_INDEX): any);
    if (forceIndex === null) {
      return -1;
    }
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
   * - `filteredEdges`: any edges already fetched for the given `calls`.
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
    const range: ?GraphQLRange = (this._getField(connectionID, RANGE): any);
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
    const filterCalls = getFilterCalls(calls);
    // Edges can only be fetched if a range call (first/last/find) is given.
    // Otherwise return diffCalls/filterCalls with empty edges.
    if (calls.length === filterCalls.length) {
      return {
        diffCalls: calls,
        filterCalls,
        pageInfo: undefined,
        requestedEdgeIDs: [],
        filteredEdges: [],
      };
    }
    const queuedRecord = this._queuedRecords ?
      this._queuedRecords[connectionID] :
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
    var filteredEdges;
    if (requestedEdgeIDs) {
      filteredEdges = requestedEdgeIDs
        .map(edgeID => ({
          edgeID,
          nodeID: this.getLinkedRecordID(edgeID, NODE),
        }))
        .filter(edge => this._getRecord(edge.nodeID));
    } else {
      filteredEdges = [];
    }
    return {
      diffCalls,
      filterCalls,
      pageInfo,
      requestedEdgeIDs,
      filteredEdges,
    };
  }

  /**
   * Returns whether there is a range at `connectionID`.
   */
  hasRange(connectionID: DataID): boolean {
    return !!this._getField(connectionID, RANGE);
  }

  /**
   * Completely removes the record identified by `dataID` from the store.
   * This is only used by garbage collection.
   */
  removeRecord(dataID: DataID): void {
    delete this._records[dataID];
    if (this._queuedRecords) {
      delete this._queuedRecords[dataID];
    }
    if (this._cachedRecords) {
      delete this._cachedRecords[dataID];
    }
    delete this._nodeConnectionMap[dataID];
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
   * Get the value of the field from the first version of the record for which
   * the field is defined, returning `null` if the record has been deleted or
   * `undefined` if the record has not been fetched.
   */
  _getField(dataID: DataID, storageKey: string): ?FieldValue {
    const storage = this._storage;
    for (let ii = 0; ii < storage.length; ii++) {
      const record = storage[ii][dataID];
      if (record === null) {
        return null;
      } else if (record && record.hasOwnProperty(storageKey)) {
        return record[storageKey];
      }
    }
    return undefined;
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
 * field name for 'profile_picture{size:"50"}' will be 'profile_picture'
 */
function getFieldNameFromKey(key: string): ?string {
  // This is based on the GraphQL spec for what constitutes a valid field name.
  return key.split(/(?![_A-Za-z][_0-9A-Za-z]*)/, 1)[0];
}

module.exports = RelayRecordStore;
