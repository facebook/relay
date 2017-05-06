/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule restoreRelayCacheData
 * @flow
 * @format
 */

'use strict';

const RelayCacheProcessor = require('RelayCacheProcessor');
const RelayChangeTracker = require('RelayChangeTracker');
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
const RelayQueryPath = require('RelayQueryPath');
const RelayRecord = require('RelayRecord');

const findRelayQueryLeaves = require('findRelayQueryLeaves');
const forEachObject = require('forEachObject');
const invariant = require('invariant');

import type RelayGarbageCollector from 'RelayGarbageCollector';
import type {DataID, RelayQuerySet, RootCallMap} from 'RelayInternalTypes';
import type {QueryPath} from 'RelayQueryPath';
import type {Record, RecordMap} from 'RelayRecord';
import type RelayRecordStore from 'RelayRecordStore';
import type {
  Abortable,
  CacheManager,
  CacheProcessorCallbacks,
} from 'RelayTypes';
import type {NodeState} from 'findRelayQueryLeaves';

/**
 * @internal
 *
 * Retrieves data for queries or fragments from disk into `cachedRecords`.
 */
function restoreFragmentDataFromCache(
  dataID: DataID,
  fragment: RelayQuery.Fragment,
  path: QueryPath,
  store: RelayRecordStore,
  cachedRecords: RecordMap,
  cachedRootCallMap: RootCallMap,
  garbageCollector: ?RelayGarbageCollector,
  cacheManager: CacheManager,
  changeTracker: RelayChangeTracker,
  callbacks: CacheProcessorCallbacks,
): Abortable {
  const restorator = new RelayCachedDataRestorator(
    cacheManager,
    store,
    cachedRecords,
    cachedRootCallMap,
    changeTracker,
    callbacks,
    garbageCollector,
  );
  restorator.restoreFragmentData(dataID, fragment, path);

  return {
    abort() {
      restorator.abort();
    },
  };
}

function restoreQueriesDataFromCache(
  queries: RelayQuerySet,
  store: RelayRecordStore,
  cachedRecords: RecordMap,
  cachedRootCallMap: RootCallMap,
  garbageCollector: ?RelayGarbageCollector,
  cacheManager: CacheManager,
  changeTracker: RelayChangeTracker,
  callbacks: CacheProcessorCallbacks,
): Abortable {
  const restorator = new RelayCachedDataRestorator(
    cacheManager,
    store,
    cachedRecords,
    cachedRootCallMap,
    changeTracker,
    callbacks,
    garbageCollector,
  );
  restorator.restoreQueriesData(queries);

  return {
    abort() {
      restorator.abort();
    },
  };
}

class RelayCachedDataRestorator extends RelayCacheProcessor<NodeState> {
  _cachedRecords: RecordMap;
  _cachedRootCallMap: RootCallMap;
  _changeTracker: RelayChangeTracker;
  _garbageCollector: ?RelayGarbageCollector;
  _store: RelayRecordStore;

  constructor(
    cacheManager: CacheManager,
    store: RelayRecordStore,
    cachedRecords: RecordMap,
    cachedRootCallMap: RootCallMap,
    changeTracker: RelayChangeTracker,
    callbacks: CacheProcessorCallbacks,
    garbageCollector: ?RelayGarbageCollector,
  ) {
    super(cacheManager, callbacks);
    this._cachedRecords = cachedRecords;
    this._cachedRootCallMap = cachedRootCallMap;
    this._changeTracker = changeTracker;
    this._garbageCollector = garbageCollector;
    this._store = store;
  }

  handleNodeVisited(
    node: RelayQuery.Node,
    dataID: DataID,
    record: ?Record,
    nextState: NodeState,
  ): void {
    const recordState = this._store.getRecordState(dataID);
    this._cachedRecords[dataID] = record;
    // Mark records as created/updated as necessary. Note that if the
    // record is known to be deleted in the store then it will have been
    // been marked as created already. Further, it does not need to be
    // updated since no additional data can be read about a deleted node.
    if (recordState === 'UNKNOWN' && record !== undefined) {
      // Register immediately in case anything tries to read and subscribe
      // to this record (which means incrementing reference counts).
      if (this._garbageCollector) {
        this._garbageCollector.register(dataID);
      }
      // Mark as created if the store did not have a record but disk cache
      // did (either a known record or known deletion).
      this._changeTracker.createID(dataID);
    } else if (recordState === 'EXISTENT' && record != null) {
      // Mark as updated only if a record exists in both the store and
      // disk cache.
      this._changeTracker.updateID(dataID);
    }
    if (!record) {
      // We are out of luck if disk doesn't have the node either.
      this.handleFailure();
      return;
    }
    if (RelayRecord.isClientID(dataID)) {
      record.__path__ = nextState.path;
    }
  }

  handleIdentifiedRootVisited(
    query: RelayQuery.Root,
    dataID: ?DataID,
    identifyingArgKey: ?string,
    nextState: NodeState,
  ): void {
    if (dataID == null) {
      // Read from cache and we still don't have a valid `dataID`.
      this.handleFailure();
      return;
    }
    const storageKey = query.getStorageKey();
    this._cachedRootCallMap[storageKey] = this._cachedRootCallMap[
      storageKey
    ] || {};
    this._cachedRootCallMap[storageKey][identifyingArgKey || ''] = dataID;
    nextState.dataID = dataID;
  }

  restoreFragmentData(
    dataID: DataID,
    fragment: RelayQuery.Fragment,
    path: QueryPath,
  ): void {
    this.process(() => {
      this.visitFragment(fragment, {
        dataID,
        node: fragment,
        path,
        rangeCalls: undefined,
      });
    });
  }

  restoreQueriesData(queries: RelayQuerySet): void {
    this.process(() => {
      forEachObject(queries, query => {
        if (this._state === 'COMPLETED') {
          return;
        }
        if (query) {
          this.visitRoot(query, {
            dataID: undefined,
            node: query,
            path: RelayQueryPath.create(query),
            rangeCalls: undefined,
          });
        }
      });
    });
  }

  traverse(node: RelayQuery.Node, nextState: NodeState): void {
    invariant(
      nextState.dataID != null,
      'RelayCachedDataRestorator: Attempted to traverse without a ' +
        '`dataID`.',
    );
    const {missingData, pendingNodeStates} = findRelayQueryLeaves(
      this._store,
      this._cachedRecords,
      nextState.node,
      nextState.dataID,
      nextState.path,
      nextState.rangeCalls,
    );
    if (missingData) {
      this.handleFailure();
      return;
    }
    for (let ii = 0; ii < pendingNodeStates.length; ii++) {
      if (this._state === 'COMPLETED') {
        return;
      }
      invariant(
        pendingNodeStates[ii].dataID != null,
        'RelayCachedDataRestorator: Attempted to visit a node without ' +
          'a `dataID`.',
      );
      this.visitNode(
        pendingNodeStates[ii].node,
        pendingNodeStates[ii].dataID,
        pendingNodeStates[ii],
      );
    }
  }

  visitIdentifiedRoot(
    query: RelayQuery.Root,
    identifyingArgKey: ?string,
    nextState: NodeState,
  ): void {
    const dataID = this._store.getDataID(
      query.getStorageKey(),
      identifyingArgKey,
    );
    if (dataID == null) {
      super.visitIdentifiedRoot(query, identifyingArgKey, nextState);
    } else {
      this.traverse(query, {
        dataID,
        node: query,
        path: RelayQueryPath.create(query),
        rangeCalls: undefined,
      });
    }
  }
}

RelayProfiler.instrumentMethods(RelayCachedDataRestorator.prototype, {
  handleIdentifiedRootVisited: 'RelayCachedDataRestorator.handleIdentifiedRootVisited',
  handleNodeVisited: 'RelayCachedDataRestorator.handleNodeVisited',
  queueIdentifiedRoot: 'RelayCachedDataRestorator.queueRoot',
  queueNode: 'RelayCachedDataRestorator.queueNode',
  restoreFragmentData: 'RelayCachedDataRestorator.readFragment',
  restoreQueriesData: 'RelayCachedDataRestorator.read',
  traverse: 'RelayCachedDataRestorator.traverse',
  visitNode: 'RelayCachedDataRestorator.visitNode',
  visitRoot: 'RelayCachedDataRestorator.visitRoot',
});

module.exports = {
  restoreFragmentDataFromCache,
  restoreQueriesDataFromCache,
};
