/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule readRelayDiskCache
 * @flow
 * @typechecks
 */

'use strict';

const GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
const RelayChangeTracker = require('RelayChangeTracker');
import type {
  DataID,
  Records,
  RelayQuerySet,
  RootCallMap,
} from 'RelayInternalTypes';
const RelayQuery = require('RelayQuery');
const RelayQueryPath = require('RelayQueryPath');
import type RelayRecordStore from 'RelayRecordStore';
import type {CacheManager, CacheReadCallbacks} from 'RelayTypes';

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
 * Retrieves data for a query from disk into `cachedRecords` in RelayStore.
 */
function readRelayDiskCache(
  queries: RelayQuerySet,
  store: RelayRecordStore,
  cachedRecords: Records,
  cachedRootCallMap: RootCallMap,
  cacheManager: CacheManager,
  changeTracker: RelayChangeTracker,
  callbacks: CacheReadCallbacks
): void {
  var reader = new RelayCacheReader(
    store,
    cachedRecords,
    cachedRootCallMap,
    cacheManager,
    changeTracker,
    callbacks
  );

  reader.read(queries);
}

class RelayCacheReader {
  _store: RelayRecordStore;
  _cachedRecords: Records;
  _cachedRootCallMap: RootCallMap;
  _cacheManager: CacheManager;
  _callbacks: CacheReadCallbacks;
  _changeTracker: RelayChangeTracker;
  _hasFailed: boolean;
  _pendingNodes: PendingNodes;
  _pendingRoots: PendingRoots;

  constructor(
    store: RelayRecordStore,
    cachedRecords: Records,
    cachedRootCallMap: RootCallMap,
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

    this._hasFailed = false;
    this._pendingNodes = {};
    this._pendingRoots = {};
  }

  read(queries: RelayQuerySet): void {
    forEachObject(queries, query => {
      if (this._hasFailed) {
        return;
      }
      if (query) {
        const storageKey = query.getStorageKey();
        forEachRootCallArg(query, identifyingArgValue => {
          if (this._hasFailed) {
            return;
          }
          identifyingArgValue = identifyingArgValue || '';
          this._visitRoot(storageKey, identifyingArgValue, query);
        });
      }
    });

    if (this._isDone()) {
      this._callbacks.onSuccess && this._callbacks.onSuccess();
    }
  }

  _visitRoot(
    storageKey: string,
    identifyingArgValue: string,
    query: RelayQuery.Root
  ): void {
    var dataID = this._store.getDataID(storageKey, identifyingArgValue);
    if (dataID == null) {
      if (this._cachedRootCallMap.hasOwnProperty(storageKey) &&
          this._cachedRootCallMap[storageKey].hasOwnProperty(
            identifyingArgValue
          )
      ) {
        // Already attempted to read this root from cache.
        this._handleFailed();
      } else {
        this._queueRoot(storageKey, identifyingArgValue, query);
      }
    } else {
      this._visitNode(
        dataID,
        {
          node: query,
          path: new RelayQueryPath(query),
          rangeCalls: undefined,
        }
      );
    }
  }

  _queueRoot(
    storageKey: string,
    identifyingArgValue: string,
    query: RelayQuery.Root
  ) {
    var rootKey = storageKey + '*' + identifyingArgValue;
    if (this._pendingRoots.hasOwnProperty(rootKey)) {
      this._pendingRoots[rootKey].push(query);
    } else {
      this._pendingRoots[rootKey] = [query];
      this._cacheManager.readRootCall(
        storageKey,
        identifyingArgValue,
        (error, value) => {
          if (this._hasFailed) {
            return;
          }
          if (error) {
            this._handleFailed();
            return;
          }
          var roots = this._pendingRoots[rootKey];
          delete this._pendingRoots[rootKey];

          this._cachedRootCallMap[storageKey] =
            this._cachedRootCallMap[storageKey] || {};
          this._cachedRootCallMap[storageKey][identifyingArgValue] = value;
          if (this._cachedRootCallMap[storageKey][identifyingArgValue] ==
              null) {
            // Read from cache and we still don't have valid `dataID`.
            this._handleFailed();
          } else {
            const dataID = value;
            roots.forEach(root => {
              if (this._hasFailed) {
                return;
              }
              this._visitNode(
                dataID,
                {
                  node: root,
                  path: new RelayQueryPath(root),
                  rangeCalls: undefined,
                }
              );
            });
          }
          if (this._isDone()) {
            this._callbacks.onSuccess && this._callbacks.onSuccess();
          }
        }
      );
    }
  }

  _visitNode(dataID: DataID, pendingItem: PendingItem): void {
    var {missingData, pendingNodes} = findRelayQueryLeaves(
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
    forEachObject(pendingNodes, (pendingItems, dataID) => {
      this._queueNode(dataID, pendingItems);
    });
  }

  _queueNode(dataID: DataID, pendingItems: Array<PendingItem>): void {
    if (this._pendingNodes.hasOwnProperty(dataID)) {
      this._pendingNodes[dataID].push(...pendingItems);
    } else {
      this._pendingNodes[dataID] = pendingItems;
      this._cacheManager.readNode(
        dataID,
        (error, value) => {
          if (this._hasFailed) {
            return;
          }
          if (error) {
            this._handleFailed();
            return;
          }
          if (value && GraphQLStoreDataHandler.isClientID(dataID)) {
            value.__path__ = pendingItems[0].path;
          }
          // Mark records as created/updated as necessary. Note that if the
          // record is known to be deleted in the store then it will have been
          // been marked as created already. Further, it does not need to be
          // updated since no additional data can be read about a deleted node.
          const recordState = this._store.getRecordState(dataID);
          if (recordState === 'UNKNOWN' && value !== undefined) {
            // Mark as created if the store did not have a value but disk cache
            // did (either a known value or known deletion).
            this._changeTracker.createID(dataID);
          } else if (recordState === 'EXISTENT' && value != null) {
            // Mark as updated only if a record exists in both the store and
            // disk cache.
            this._changeTracker.updateID(dataID);
          }
          this._cachedRecords[dataID] = value;
          var items = this._pendingNodes[dataID];
          delete this._pendingNodes[dataID];
          if (this._cachedRecords[dataID] === undefined) {
            // We are out of luck if disk doesn't have the node either.
            this._handleFailed();
          } else {
            items.forEach(item => {
              if (this._hasFailed) {
                return;
              }
              this._visitNode(dataID, item);
            });
          }
          if (this._isDone()) {
            this._callbacks.onSuccess && this._callbacks.onSuccess();
          }
        }
      );
    }
  }

  _isDone(): boolean {
    return (
      isEmpty(this._pendingRoots) &&
      isEmpty(this._pendingNodes) &&
      !this._hasFailed
    );
  }

  _handleFailed(): void {
    invariant(
      !this._hasFailed,
      'RelayStoreReader: Query set already failed'
    );

    this._hasFailed = true;
    this._callbacks.onFailure && this._callbacks.onFailure();
  }

}

module.exports = readRelayDiskCache;
