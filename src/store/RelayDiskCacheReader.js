/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayDiskCacheReader
 * @flow
 * @typechecks
 */

'use strict';

const RelayChangeTracker = require('RelayChangeTracker');
import type RelayGarbageCollector from 'RelayGarbageCollector';
import type {
  DataID,
  RelayQuerySet,
  RootCallMap,
} from 'RelayInternalTypes';
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
import type {QueryPath} from 'RelayQueryPath';
const RelayQueryPath = require('RelayQueryPath');
const RelayRecord = require('RelayRecord');
import type {RecordMap} from 'RelayRecord';
import type RelayRecordStore from 'RelayRecordStore';
import type {
  Abortable,
  CacheManager,
  CacheReadCallbacks,
} from 'RelayTypes';

const findRelayQueryLeaves = require('findRelayQueryLeaves');
import type {
  PendingItem,
  PendingNodes,
} from 'findRelayQueryLeaves';
const forEachObject = require('forEachObject');
const forEachRootCallArg = require('forEachRootCallArg');
const invariant = require('invariant');
const isEmpty = require('isEmpty');

type PendingRoots = {[key: string]: Array<RelayQuery.Root>};

/**
 * @internal
 *
 * Retrieves data for queries or fragments from disk into `cachedRecords`.
 */
const RelayDiskCacheReader = {
  readFragment(
    dataID: DataID,
    fragment: RelayQuery.Fragment,
    path: QueryPath,
    store: RelayRecordStore,
    cachedRecords: RecordMap,
    cachedRootCallMap: RootCallMap,
    garbageCollector: ?RelayGarbageCollector,
    cacheManager: CacheManager,
    changeTracker: RelayChangeTracker,
    callbacks: CacheReadCallbacks,
  ): Abortable {
    const reader = new RelayCacheReader(
      store,
      cachedRecords,
      cachedRootCallMap,
      garbageCollector,
      cacheManager,
      changeTracker,
      callbacks
    );
    reader.readFragment(dataID, fragment, path);

    return {
      abort() {
        reader.abort();
      },
    };
  },

  readQueries(
    queries: RelayQuerySet,
    store: RelayRecordStore,
    cachedRecords: RecordMap,
    cachedRootCallMap: RootCallMap,
    garbageCollector: ?RelayGarbageCollector,
    cacheManager: CacheManager,
    changeTracker: RelayChangeTracker,
    callbacks: CacheReadCallbacks,
  ): Abortable {
    const reader = new RelayCacheReader(
      store,
      cachedRecords,
      cachedRootCallMap,
      garbageCollector,
      cacheManager,
      changeTracker,
      callbacks
    );
    reader.read(queries);

    return {
      abort() {
        reader.abort();
      },
    };
  },
};

class RelayCacheReader {
  _store: RelayRecordStore;
  _cachedRecords: RecordMap;
  _cachedRootCallMap: RootCallMap;
  _cacheManager: CacheManager;
  _callbacks: CacheReadCallbacks;
  _changeTracker: RelayChangeTracker;
  _garbageCollector: ?RelayGarbageCollector;
  _pendingNodes: PendingNodes;
  _pendingRoots: PendingRoots;
  _state: 'PENDING' | 'LOADING' | 'COMPLETED';

  constructor(
    store: RelayRecordStore,
    cachedRecords: RecordMap,
    cachedRootCallMap: RootCallMap,
    garbageCollector: ?RelayGarbageCollector,
    cacheManager: CacheManager,
    changeTracker: RelayChangeTracker,
    callbacks: CacheReadCallbacks,
  ) {
    this._store = store;
    this._cachedRecords = cachedRecords;
    this._cachedRootCallMap = cachedRootCallMap;
    this._cacheManager = cacheManager;
    this._callbacks = callbacks;
    this._changeTracker = changeTracker;
    this._garbageCollector = garbageCollector;

    this._pendingNodes = {};
    this._pendingRoots = {};
    this._state = 'PENDING';
  }

  abort(): void {
    invariant(
      this._state === 'LOADING',
      'RelayCacheReader: Can only abort an in-progress read operation.'
    );
    this._state = 'COMPLETED';
  }

  read(queries: RelayQuerySet): void {
    invariant(
      this._state === 'PENDING',
      'RelayCacheReader: A `read` is in progress.'
    );
    this._state = 'LOADING';
    forEachObject(queries, query => {
      if (this._state === 'COMPLETED') {
        return;
      }
      if (query) {
        const storageKey = query.getStorageKey();
        forEachRootCallArg(query, ({identifyingArgKey}) => {
          if (this._state === 'COMPLETED') {
            return;
          }
          identifyingArgKey = identifyingArgKey || '';
          this.visitRoot(storageKey, identifyingArgKey, query);
        });
      }
    });

    if (this._isDone()) {
      this._handleSuccess();
    }
  }

  readFragment(
    dataID: DataID,
    fragment: RelayQuery.Fragment,
    path: QueryPath
  ): void {
    invariant(
      this._state === 'PENDING',
      'RelayCacheReader: A `read` is in progress.'
    );
    this._state = 'LOADING';
    this.visitNode(
      dataID,
      {
        node: fragment,
        path,
        rangeCalls: undefined,
      }
    );

    if (this._isDone()) {
      this._handleSuccess();
    }
  }

  visitRoot(
    storageKey: string,
    identifyingArgKey: string,
    query: RelayQuery.Root
  ): void {
    const dataID = this._store.getDataID(storageKey, identifyingArgKey);
    if (dataID == null) {
      if (this._cachedRootCallMap.hasOwnProperty(storageKey) &&
          this._cachedRootCallMap[storageKey].hasOwnProperty(
            identifyingArgKey
          )
      ) {
        // Already attempted to read this root from cache.
        this._handleFailed();
      } else {
        this.queueRoot(storageKey, identifyingArgKey, query);
      }
    } else {
      this.visitNode(
        dataID,
        {
          node: query,
          path: RelayQueryPath.create(query),
          rangeCalls: undefined,
        }
      );
    }
  }

  queueRoot(
    storageKey: string,
    identifyingArgKey: string,
    query: RelayQuery.Root
  ) {
    const rootKey = storageKey + '*' + identifyingArgKey;
    if (this._pendingRoots.hasOwnProperty(rootKey)) {
      this._pendingRoots[rootKey].push(query);
    } else {
      this._pendingRoots[rootKey] = [query];
      this._cacheManager.readRootCall(
        storageKey,
        identifyingArgKey,
        (error, value) => {
          if (this._state === 'COMPLETED') {
            return;
          }
          if (error) {
            this._handleFailed();
            return;
          }
          const roots = this._pendingRoots[rootKey];
          delete this._pendingRoots[rootKey];

          this._cachedRootCallMap[storageKey] =
            this._cachedRootCallMap[storageKey] || {};
          this._cachedRootCallMap[storageKey][identifyingArgKey] = value;
          if (this._cachedRootCallMap[storageKey][identifyingArgKey] ==
              null) {
            // Read from cache and we still don't have valid `dataID`.
            this._handleFailed();
          } else {
            const dataID = value;
            roots.forEach(root => {
              if (this._state === 'COMPLETED') {
                return;
              }
              this.visitNode(
                dataID,
                {
                  node: root,
                  path: RelayQueryPath.create(root),
                  rangeCalls: undefined,
                }
              );
            });
          }
          if (this._isDone()) {
            this._handleSuccess();
          }
        }
      );
    }
  }

  visitNode(dataID: DataID, pendingItem: PendingItem): void {
    const {missingData, pendingNodes} = findRelayQueryLeaves(
      this._store,
      this._cachedRecords,
      pendingItem.node,
      dataID,
      pendingItem.path,
      pendingItem.rangeCalls
    );

    if (missingData) {
      this._handleFailed();
      return;
    }
    forEachObject(pendingNodes, (pendingItems, pendingDataID) => {
      this.queueNode(pendingDataID, pendingItems);
    });
  }

  queueNode(dataID: DataID, pendingItems: Array<PendingItem>): void {
    if (this._pendingNodes.hasOwnProperty(dataID)) {
      this._pendingNodes[dataID].push(...pendingItems);
    } else {
      this._pendingNodes[dataID] = pendingItems;
      this._cacheManager.readNode(
        dataID,
        (error, value) => {
          if (this._state === 'COMPLETED') {
            return;
          }
          if (error) {
            this._handleFailed();
            return;
          }
          if (value && RelayRecord.isClientID(dataID)) {
            value.__path__ = pendingItems[0].path;
          }
          // Mark records as created/updated as necessary. Note that if the
          // record is known to be deleted in the store then it will have been
          // been marked as created already. Further, it does not need to be
          // updated since no additional data can be read about a deleted node.
          const recordState = this._store.getRecordState(dataID);
          if (recordState === 'UNKNOWN' && value !== undefined) {
            // Register immediately in case anything tries to read and subscribe
            // to this record (which means incrementing reference counts).
            if (this._garbageCollector) {
              this._garbageCollector.register(dataID);
            }
            // Mark as created if the store did not have a value but disk cache
            // did (either a known value or known deletion).
            this._changeTracker.createID(dataID);
          } else if (recordState === 'EXISTENT' && value != null) {
            // Mark as updated only if a record exists in both the store and
            // disk cache.
            this._changeTracker.updateID(dataID);
          }
          this._cachedRecords[dataID] = value;
          const items = this._pendingNodes[dataID];
          delete this._pendingNodes[dataID];
          if (this._cachedRecords[dataID] === undefined) {
            // We are out of luck if disk doesn't have the node either.
            this._handleFailed();
          } else {
            items.forEach(item => {
              if (this._state === 'COMPLETED') {
                return;
              }
              this.visitNode(dataID, item);
            });
          }
          if (this._isDone()) {
            this._handleSuccess();
          }
        }
      );
    }
  }

  _isDone(): boolean {
    return (
      isEmpty(this._pendingRoots) &&
      isEmpty(this._pendingNodes) &&
      this._state === 'LOADING'
    );
  }

  _handleFailed(): void {
    invariant(
      this._state !== 'COMPLETED',
      'RelayStoreReader: Query set already failed/completed.'
    );

    this._state = 'COMPLETED';
    this._callbacks.onFailure && this._callbacks.onFailure();
  }

  _handleSuccess(): void {
    invariant(
      this._state !== 'COMPLETED',
      'RelayStoreReader: Query set already failed/completed.'
    );

    this._state = 'COMPLETED';
    this._callbacks.onSuccess && this._callbacks.onSuccess();
  }

}

RelayProfiler.instrumentMethods(RelayCacheReader.prototype, {
  read: 'RelayCacheReader.read',
  readFragment: 'RelayCacheReader.readFragment',
  visitRoot: 'RelayCacheReader.visitRoot',
  queueRoot: 'RelayCacheReader.queueRoot',
  visitNode: 'RelayCacheReader.visitNode',
  queueNode: 'RelayCacheReader.queueNode',
});

module.exports = RelayDiskCacheReader;
