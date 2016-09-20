/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayStoreData
 * @flow
 */

'use strict';

const GraphQLQueryRunner = require('GraphQLQueryRunner');
const GraphQLRange = require('GraphQLRange');
const GraphQLStoreChangeEmitter = require('GraphQLStoreChangeEmitter');
const GraphQLStoreRangeUtils = require('GraphQLStoreRangeUtils');
const RelayChangeTracker = require('RelayChangeTracker');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayGarbageCollector = require('RelayGarbageCollector');
const RelayMutationQueue = require('RelayMutationQueue');
const RelayNetworkLayer = require('RelayNetworkLayer');
const RelayNodeInterface = require('RelayNodeInterface');
const RelayPendingQueryTracker = require('RelayPendingQueryTracker');
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
const RelayQueryPath = require('RelayQueryPath');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayQueryWriter = require('RelayQueryWriter');
const RelayRecord = require('RelayRecord');
const RelayRecordStore = require('RelayRecordStore');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayTaskQueue = require('RelayTaskQueue');

const forEachObject = require('forEachObject');
const generateForceIndex = require('generateForceIndex');
const invariant = require('invariant');
const mapObject = require('mapObject');
const warning = require('warning');
const writeRelayQueryPayload = require('writeRelayQueryPayload');
const writeRelayUpdatePayload = require('writeRelayUpdatePayload');

const {
  restoreFragmentDataFromCache,
  restoreQueriesDataFromCache,
} = require('restoreRelayCacheData');

import type {ChangeSet} from 'RelayChangeTracker';
import type {GarbageCollectionScheduler} from 'RelayGarbageCollector';
import type {
  ClientMutationID,
  DataID,
  NodeRangeMap,
  QueryPayload,
  RelayQuerySet,
  RootCallMap,
  UpdateOptions,
} from 'RelayInternalTypes';
import type {QueryPath} from 'RelayQueryPath';
import type {RecordMap} from 'RelayRecord';
import type {TaskScheduler} from 'RelayTaskQueue';
import type {Abortable, CacheManager, CacheProcessorCallbacks} from 'RelayTypes';

const {CLIENT_MUTATION_ID} = RelayConnectionInterface;
const {ID, ID_TYPE, NODE, NODE_TYPE, TYPENAME} = RelayNodeInterface;

const idField = RelayQuery.Field.build({
  fieldName: ID,
  type: 'String',
});
const typeField = RelayQuery.Field.build({
  fieldName: TYPENAME,
  type: 'String',
});

/**
 * @internal
 *
 * Wraps the data caches and associated metadata tracking objects used by
 * GraphQLStore/RelayStore.
 */
class RelayStoreData {
  _cacheManager: ?CacheManager;
  _cachedRecords: RecordMap;
  _cachedRootCallMap: RootCallMap;
  _cachedStore: RelayRecordStore;
  _changeEmitter: GraphQLStoreChangeEmitter;
  _garbageCollector: ?RelayGarbageCollector;
  _mutationQueue: RelayMutationQueue;
  _networkLayer: RelayNetworkLayer;
  _nodeRangeMap: NodeRangeMap;
  _pendingQueryTracker: RelayPendingQueryTracker;
  _records: RecordMap;
  _queuedRecords: RecordMap;
  _queuedStore: RelayRecordStore;
  _recordStore: RelayRecordStore;
  _queryTracker: ?RelayQueryTracker;
  _queryRunner: GraphQLQueryRunner;
  _rangeData: GraphQLStoreRangeUtils;
  _rootCallMap: RootCallMap;
  _taskQueue: RelayTaskQueue;

  constructor(
    cachedRecords?: RecordMap = {},
    cachedRootCallMap?: RootCallMap = {},
    queuedRecords?: RecordMap = {},
    records?: RecordMap = {},
    rootCallMap?: RootCallMap = {},
    nodeRangeMap?: NodeRangeMap = {},
    rangeData?: GraphQLStoreRangeUtils = new GraphQLStoreRangeUtils(),
  ) {
    this._cacheManager = null;
    this._cachedRecords = cachedRecords;
    this._cachedRootCallMap = cachedRootCallMap;
    this._cachedStore = new RelayRecordStore(
      {cachedRecords, records},
      {cachedRootCallMap, rootCallMap},
      nodeRangeMap
    );
    this._changeEmitter = new GraphQLStoreChangeEmitter(rangeData);
    this._mutationQueue = new RelayMutationQueue(this);
    this._networkLayer = new RelayNetworkLayer();
    this._nodeRangeMap = nodeRangeMap;
    this._pendingQueryTracker = new RelayPendingQueryTracker(this);
    this._queryRunner = new GraphQLQueryRunner(this);
    this._queryTracker = new RelayQueryTracker();
    this._queuedRecords = queuedRecords;
    this._queuedStore = new RelayRecordStore(
      {cachedRecords, queuedRecords, records},
      {cachedRootCallMap, rootCallMap},
      nodeRangeMap
    );
    this._records = records;
    this._recordStore = new RelayRecordStore(
      {records},
      {rootCallMap},
      nodeRangeMap
    );
    this._rangeData = rangeData;
    this._rootCallMap = rootCallMap;
    this._taskQueue = new RelayTaskQueue();
  }

  /**
   * Creates a garbage collector for this instance. After initialization all
   * newly added DataIDs will be registered in the created garbage collector.
   * This will show a warning if data has already been added to the instance.
   */
  initializeGarbageCollector(scheduler: GarbageCollectionScheduler): void {
    invariant(
      !this._garbageCollector,
      'RelayStoreData: Garbage collector is already initialized.'
    );
    const shouldInitialize = this._isStoreDataEmpty();
    warning(
      shouldInitialize,
      'RelayStoreData: Garbage collection can only be initialized when no ' +
      'data is present.'
    );
    if (shouldInitialize) {
      this._garbageCollector = new RelayGarbageCollector(this, scheduler);
    }
  }

  /**
   * @internal
   *
   * Sets/clears the query tracker.
   *
   * @warning Do not use this unless your application uses only
   * `RelayGraphQLMutation` for mutations.
   */
  injectQueryTracker(queryTracker: ?RelayQueryTracker): void {
    this._queryTracker = queryTracker;
  }

  /**
   * Sets/clears the scheduling function used by the internal task queue to
   * schedule units of work for execution.
   */
  injectTaskScheduler(scheduler: ?TaskScheduler): void {
    this._taskQueue.injectScheduler(scheduler);
  }

  /**
   * Sets/clears the cache manager that is used to cache changes written to
   * the store.
   */
  injectCacheManager(cacheManager: ?CacheManager): void {
    this._cacheManager = cacheManager;
  }

  clearCacheManager(): void {
    this._cacheManager = null;
  }

  hasCacheManager(): boolean {
    return !!this._cacheManager;
  }

  getCacheManager(): ?CacheManager {
    return this._cacheManager;
  }

  /**
   * Returns whether a given record is affected by an optimistic update.
   */
  hasOptimisticUpdate(dataID: DataID): boolean {
    dataID = this.getRangeData().getCanonicalClientID(dataID);
    return this.getQueuedStore().hasOptimisticUpdate(dataID);
  }

  /**
   * Returns a list of client mutation IDs for queued mutations whose optimistic
   * updates are affecting the record corresponding the given dataID. Returns
   * null if the record isn't affected by any optimistic updates.
   */
  getClientMutationIDs(dataID: DataID): ?Array<ClientMutationID> {
    dataID = this.getRangeData().getCanonicalClientID(dataID);
    return this.getQueuedStore().getClientMutationIDs(dataID);
  }

  /**
   * Restores data for queries incrementally from cache.
   * It calls onSuccess when all the data has been loaded into memory.
   * It calls onFailure when some data is unabled to be satisfied from cache.
   */
  restoreQueriesFromCache(
    queries: RelayQuerySet,
    callbacks: CacheProcessorCallbacks
  ): Abortable {
    const cacheManager = this._cacheManager;
    invariant(
      cacheManager,
      'RelayStoreData: `restoreQueriesFromCache` should only be called ' +
      'when cache manager is available.'
    );
    const changeTracker = new RelayChangeTracker();
    const profile = RelayProfiler.profile('RelayStoreData.readFromDiskCache');
    return restoreQueriesDataFromCache(
      queries,
      this._queuedStore,
      this._cachedRecords,
      this._cachedRootCallMap,
      this._garbageCollector,
      cacheManager,
      changeTracker,
      {
        onSuccess: () => {
          this._handleChangedAndNewDataIDs(changeTracker.getChangeSet());
          profile.stop();
          callbacks.onSuccess && callbacks.onSuccess();
        },
        onFailure: () => {
          this._handleChangedAndNewDataIDs(changeTracker.getChangeSet());
          profile.stop();
          callbacks.onFailure && callbacks.onFailure();
        },
      }
    );
  }

  /**
   * Restores data for a fragment incrementally from cache.
   * It calls onSuccess when all the data has been loaded into memory.
   * It calls onFailure when some data is unabled to be satisfied from cache.
   */
  restoreFragmentFromCache(
    dataID: DataID,
    fragment: RelayQuery.Fragment,
    path: QueryPath,
    callbacks: CacheProcessorCallbacks
  ): Abortable {
    const cacheManager = this._cacheManager;
    invariant(
      cacheManager,
      'RelayStoreData: `restoreFragmentFromCache` should only be called when ' +
      'cache manager is available.'
    );
    const changeTracker = new RelayChangeTracker();
    const profile =
      RelayProfiler.profile('RelayStoreData.readFragmentFromDiskCache');
    return restoreFragmentDataFromCache(
      dataID,
      fragment,
      path,
      this._queuedStore,
      this._cachedRecords,
      this._cachedRootCallMap,
      this._garbageCollector,
      cacheManager,
      changeTracker,
      {
        onSuccess: () => {
          this._handleChangedAndNewDataIDs(changeTracker.getChangeSet());
          profile.stop();
          callbacks.onSuccess && callbacks.onSuccess();
        },
        onFailure: () => {
          this._handleChangedAndNewDataIDs(changeTracker.getChangeSet());
          profile.stop();
          callbacks.onFailure && callbacks.onFailure();
        },
      }
    );
  }

  /**
   * Write the results of a query into the base record store.
   */
  handleQueryPayload(
    query: RelayQuery.Root,
    payload: QueryPayload,
    forceIndex: ?number
  ): void {
    const profiler = RelayProfiler.profile('RelayStoreData.handleQueryPayload');
    const changeTracker = new RelayChangeTracker();
    const writer = new RelayQueryWriter(
      this._queuedStore,
      this.getRecordWriter(),
      this._queryTracker,
      changeTracker,
      {
        forceIndex,
        updateTrackedQueries: true,
      }
    );
    writeRelayQueryPayload(
      writer,
      query,
      payload
    );
    this._handleChangedAndNewDataIDs(changeTracker.getChangeSet());
    profiler.stop();
  }

  /**
   * Write the result of a fragment into the base record store.
   */
  handleFragmentPayload(
    dataID: DataID,
    fragment: RelayQuery.Fragment,
    path: QueryPath,
    payload: QueryPayload,
    forceIndex: ?number
  ): void {
    const profiler =
      RelayProfiler.profile('RelayStoreData.handleFragmentPayload');
    const changeTracker = new RelayChangeTracker();
    const writer = new RelayQueryWriter(
      this._queuedStore,
      this.getRecordWriter(),
      this._queryTracker,
      changeTracker,
      {
        forceIndex,
        updateTrackedQueries: true,
      }
    );
    writer.createRecordIfMissing(fragment, dataID, path, payload);
    writer.writePayload(fragment, dataID, payload, path);
    this._handleChangedAndNewDataIDs(changeTracker.getChangeSet());
    profiler.stop();
  }

  /**
   * Write the results of an update into the base record store.
   */
  handleUpdatePayload(
    operation: RelayQuery.Operation,
    payload: {[key: string]: mixed},
    {configs, isOptimisticUpdate}: UpdateOptions
  ): void {
    const profiler = RelayProfiler.profile('RelayStoreData.handleUpdatePayload');
    const changeTracker = new RelayChangeTracker();
    let recordWriter;
    if (isOptimisticUpdate) {
      const clientMutationID = payload[CLIENT_MUTATION_ID];
      invariant(
        typeof clientMutationID === 'string',
        'RelayStoreData.handleUpdatePayload(): Expected optimistic payload ' +
        'to have a valid `%s`.',
        CLIENT_MUTATION_ID
      );
      recordWriter =
        this.getRecordWriterForOptimisticMutation(clientMutationID);
    } else {
      recordWriter = this._getRecordWriterForMutation();
    }
    const writer = new RelayQueryWriter(
      this._queuedStore,
      recordWriter,
      this._queryTracker,
      changeTracker,
      {
        forceIndex: generateForceIndex(),
        isOptimisticUpdate,
        updateTrackedQueries: false,
      }
    );
    writeRelayUpdatePayload(
      writer,
      operation,
      payload,
      {configs, isOptimisticUpdate}
    );
    this._handleChangedAndNewDataIDs(changeTracker.getChangeSet());
    profiler.stop();
  }

  /**
   * Given a query fragment and a data ID, returns a root query that applies
   * the fragment to the object specified by the data ID.
   */
  buildFragmentQueryForDataID(
    fragment: RelayQuery.Fragment,
    dataID: DataID
  ): RelayQuery.Root {
    if (RelayRecord.isClientID(dataID)) {
      const path = this._queuedStore.getPathToRecord(
        this._rangeData.getCanonicalClientID(dataID),
      );
      invariant(
        path,
        'RelayStoreData.buildFragmentQueryForDataID(): Cannot refetch ' +
        'record `%s` without a path.',
        dataID
      );
      return RelayQueryPath.getQuery(
        this._cachedStore,
        path,
        fragment
      );
    }
    // Fragment fields cannot be spread directly into the root because they
    // may not exist on the `Node` type.
    return RelayQuery.Root.build(
      fragment.getDebugName() || 'UnknownQuery',
      NODE,
      dataID,
      [idField, typeField, fragment],
      {
        identifyingArgName: ID,
        identifyingArgType: ID_TYPE,
        isAbstract: true,
        isDeferred: false,
        isPlural: false,
      },
      NODE_TYPE
    );
  }

  getNodeData(): RecordMap {
    return this._records;
  }

  getQueuedData(): RecordMap {
    return this._queuedRecords;
  }

  clearQueuedData(): void {
    forEachObject(this._queuedRecords, (_, key) => {
      delete this._queuedRecords[key];
      this._changeEmitter.broadcastChangeForID(key);
    });
  }

  getCachedData(): RecordMap {
    return this._cachedRecords;
  }

  getGarbageCollector(): ?RelayGarbageCollector {
    return this._garbageCollector;
  }

  getMutationQueue(): RelayMutationQueue {
    return this._mutationQueue;
  }

  getNetworkLayer(): RelayNetworkLayer {
    return this._networkLayer;
  }

  /**
   * Get the record store with only the cached and base data (no queued data).
   */
  getCachedStore(): RelayRecordStore {
    return this._cachedStore;
  }

  /**
   * Get the record store with full data (cached, base, queued).
   */
  getQueuedStore(): RelayRecordStore {
    return this._queuedStore;
  }

  /**
   * Get the record store with only the base data (no queued/cached data).
   */
  getRecordStore(): RelayRecordStore {
    return this._recordStore;
  }

  /**
   * Get the record writer for the base data.
   */
  getRecordWriter(): RelayRecordWriter {
    return new RelayRecordWriter(
      this._records,
      this._rootCallMap,
      false, // isOptimistic
      (this._nodeRangeMap: $FixMe),
      this._cacheManager ?
        this._cacheManager.getQueryWriter() :
        null
    );
  }

  getQueryTracker(): ?RelayQueryTracker {
    return this._queryTracker;
  }

  getQueryRunner(): GraphQLQueryRunner {
    return this._queryRunner;
  }

  getChangeEmitter(): GraphQLStoreChangeEmitter {
    return this._changeEmitter;
  }

  getRangeData(): GraphQLStoreRangeUtils {
    return this._rangeData;
  }

  getPendingQueryTracker(): RelayPendingQueryTracker {
    return this._pendingQueryTracker;
  }

  getTaskQueue(): RelayTaskQueue {
    return this._taskQueue;
  }

  /**
   * @deprecated
   *
   * Used temporarily by GraphQLStore, but all updates to this object are now
   * handled through a `RelayRecordStore` instance.
   */
  getRootCallData(): RootCallMap {
    return this._rootCallMap;
  }

  _isStoreDataEmpty(): boolean {
    return (
      Object.keys(this._records).length === 0 &&
      Object.keys(this._queuedRecords).length === 0 &&
      Object.keys(this._cachedRecords).length === 0
    );
  }

  /**
   * Given a ChangeSet, broadcasts changes for updated DataIDs
   * and registers new DataIDs with the garbage collector.
   */
  _handleChangedAndNewDataIDs(changeSet: ChangeSet): void {
    const updatedDataIDs = Object.keys(changeSet.updated);
    const createdDataIDs = Object.keys(changeSet.created);
    const gc = this._garbageCollector;
    updatedDataIDs.forEach(id => this._changeEmitter.broadcastChangeForID(id));
    // Containers may be subscribed to "new" records in the case where they
    // were previously garbage collected or where the link was incrementally
    // loaded from cache prior to the linked record.
    createdDataIDs.forEach(id => {
      gc && gc.register(id);
      this._changeEmitter.broadcastChangeForID(id);
    });
  }

  _getRecordWriterForMutation(): RelayRecordWriter {
    return new RelayRecordWriter(
      this._records,
      this._rootCallMap,
      false, // isOptimistic
      (this._nodeRangeMap: $FixMe),
      this._cacheManager ?
        this._cacheManager.getMutationWriter() :
        null
    );
  }

  getRecordWriterForOptimisticMutation(
    clientMutationID: ClientMutationID
  ): RelayRecordWriter {
    return new RelayRecordWriter(
      this._queuedRecords,
      this._rootCallMap,
      true, // isOptimistic
      this._nodeRangeMap,
      null, // don't cache optimistic data
      clientMutationID
    );
  }

  toJSON() {
    /**
     * A util function which remove the querypath from the record. Used to stringify the RecordMap.
     */
    const getRecordsWithoutPaths = (recordMap: ?RecordMap) => {
      return mapObject(recordMap, record => {
        const nextRecord = {...record};
        delete nextRecord[RelayRecord.MetadataKey.PATH];
        return nextRecord;
      });
    };

    return {
      cachedRecords: getRecordsWithoutPaths(this._cachedRecords),
      cachedRootCallMap: this._cachedRootCallMap,
      queuedRecords: getRecordsWithoutPaths(this._queuedRecords),
      records: getRecordsWithoutPaths(this._records),
      rootCallMap: this._rootCallMap,
      nodeRangeMap: this._nodeRangeMap,
    };
  }

  static fromJSON(obj): RelayStoreData {
    invariant(
      obj,
      'RelayStoreData: JSON object is empty',
    );
    const {
      cachedRecords,
      cachedRootCallMap,
      queuedRecords,
      records,
      rootCallMap,
      nodeRangeMap,
    } = obj;

    deserializeRecordRanges(cachedRecords);
    deserializeRecordRanges(queuedRecords);
    deserializeRecordRanges(records);

    return new RelayStoreData(
      cachedRecords,
      cachedRootCallMap,
      queuedRecords,
      records,
      rootCallMap,
      nodeRangeMap,
    );
  }
}

/**
 * A helper function which checks for serialized GraphQLRange
 * instances and deserializes them in toJSON()
 */
function deserializeRecordRanges(records) {
  for (const key in records) {
    const record = records[key];
    const range = record.__range__;
    if (range) {
      record.__range__ = GraphQLRange.fromJSON(range);
    }
  }
}

RelayProfiler.instrumentMethods(RelayStoreData.prototype, {
  handleQueryPayload: 'RelayStoreData.prototype.handleQueryPayload',
  handleUpdatePayload: 'RelayStoreData.prototype.handleUpdatePayload',
});

module.exports = RelayStoreData;
