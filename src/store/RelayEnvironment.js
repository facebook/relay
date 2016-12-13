/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayEnvironment
 * @flow
 */

'use strict';

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
const RelayMetaRoute = require('RelayMetaRoute');
const RelayQuery = require('RelayQuery');
const RelayQueryPath = require('RelayQueryPath');
const RelayQueryResultObservable = require('RelayQueryResultObservable');
const RelayStoreData = require('RelayStoreData');

const deepFreeze = require('deepFreeze');
const forEachRootCallArg = require('forEachRootCallArg');
const readRelayQueryData = require('readRelayQueryData');
const recycleNodesInto = require('recycleNodesInto');
const relayUnstableBatchedUpdates = require('relayUnstableBatchedUpdates');
const warning = require('warning');

import type {
  Disposable,
  Selector,
  Snapshot,
} from 'RelayEnvironmentTypes';
import type {
  DataID,
  QueryPayload,
  RelayQuerySet,
} from 'RelayInternalTypes';
import type RelayMutation from 'RelayMutation';
import type RelayMutationTransaction from 'RelayMutationTransaction';
import type {MutationCallback, QueryCallback} from 'RelayNetworkLayer';
import type RelayQueryTracker from 'RelayQueryTracker';
import type {TaskScheduler} from 'RelayTaskQueue';
import type {
  Abortable,
  Observable,
  RelayMutationTransactionCommitCallbacks,
  ReadyStateChangeCallback,
  StoreReaderData,
  StoreReaderOptions,
  CacheManager,
} from 'RelayTypes';
import type {ChangeSubscription, NetworkLayer} from 'RelayTypes';

export type FragmentResolver = {
  dispose(): void,
  resolve(
    fragment: RelayQuery.Fragment,
    dataIDs: DataID | Array<DataID>
  ): ?(StoreReaderData | Array<?StoreReaderData>),
};

export interface RelayEnvironmentInterface {
  forceFetch(
    querySet: RelayQuerySet,
    onReadyStateChange: ReadyStateChangeCallback
  ): Abortable,
  getFragmentResolver(
    fragment: RelayQuery.Fragment,
    onNext: () => void
  ): FragmentResolver,
  getStoreData(): RelayStoreData,
  primeCache(
    querySet: RelayQuerySet,
    onReadyStateChange: ReadyStateChangeCallback
  ): Abortable,
  read(
    node: RelayQuery.Node,
    dataID: DataID,
    options?: StoreReaderOptions
  ): ?StoreReaderData,
  readQuery(
    root: RelayQuery.Root,
    options?: StoreReaderOptions
  ): Array<?StoreReaderData>,
}

/**
 * @public
 *
 * `RelayEnvironment` is the public API for Relay core. Each instance provides
 * an isolated environment with:
 * - Methods for fetching and updating data.
 * - An in-memory cache of fetched data.
 * - A configurable network layer for resolving queries/mutations.
 * - A configurable task scheduler to control when internal tasks are executed.
 *
 * No data or configuration is shared between instances. We recommend creating
 * one `RelayEnvironment` instance per user: client apps may share a single
 * instance, server apps may create one instance per HTTP request.
 */
class RelayEnvironment {
  commitPayload(
    selector: Selector,
    payload: QueryPayload,
  ): void {
    const fragment = RelayQuery.Fragment.create(
      selector.node,
      RelayMetaRoute.get('$RelayEnvironment'),
      selector.variables,
    );
    const path = RelayQueryPath.getRootRecordPath();
    this._storeData.handleFragmentPayload(
      selector.dataID,
      fragment,
      path,
      payload,
      null, // forceIndex
    );
  }

  /**
   * An internal implementation of the "lookup" API that is shared by `lookup()`
   * and `subscribe()`. Note that `subscribe()` cannot use `lookup()` directly,
   * since the former may modify the result data before freezing it.
   */
  _lookup(selector: Selector): Snapshot {
    const fragment = RelayQuery.Fragment.create(
      selector.node,
      RelayMetaRoute.get('$RelayEnvironment'),
      selector.variables,
    );
    const {data, dataIDs} = readRelayQueryData(this._storeData, fragment, selector.dataID);
    // Ensure that the root ID is considered "seen" and will be watched for
    // changes if the returned selector is passed to `subscribe()`.
    dataIDs[selector.dataID] = true;
    return {
      ...selector,
      data,
      seenRecords: (dataIDs: any),
    };
  }

  lookup(selector: Selector): Snapshot {
    const snapshot = this._lookup(selector);
    if (__DEV__) {
      deepFreezeSnapshot(snapshot);
    }
    return snapshot;
  }

  subscribe(
    snapshot: Snapshot,
    callback: (snapshot: Snapshot) => void,
  ): Disposable {
    let subscription;
    const changeEmitter = this._storeData.getChangeEmitter();
    const update = () => {
      // Re-read data and see if anything changed
      const nextSnapshot = this._lookup(snapshot);
      // Note that `recycleNodesInto` may modify the "next" value
      nextSnapshot.data = recycleNodesInto(snapshot.data, nextSnapshot.data);
      if (nextSnapshot.data === snapshot.data) {
        // The record changes don't affect the results of the selector
        return;
      }
      if (__DEV__) {
        deepFreezeSnapshot(nextSnapshot);
      }
      if (subscription) {
        subscription.remove();
      }
      subscription = changeEmitter.addListenerForIDs(
        Object.keys(nextSnapshot.seenRecords),
        update,
      );
      snapshot = nextSnapshot;
      callback(snapshot);
    };
    subscription = changeEmitter.addListenerForIDs(
      Object.keys(snapshot.seenRecords),
      update,
    );
    return {
      dispose() {
        if (subscription) {
          subscription.remove();
          subscription = null;
        }
      },
    };
  }

  applyUpdate: (
    mutation: RelayMutation<any>,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ) => RelayMutationTransaction;
  commitUpdate: (
    mutation: RelayMutation<any>,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ) => RelayMutationTransaction;
  _storeData: RelayStoreData;

  constructor(storeData?: RelayStoreData) {
    this._storeData = storeData ? storeData : new RelayStoreData();
    this._storeData.getChangeEmitter().injectBatchingStrategy(
      relayUnstableBatchedUpdates
    );
    this.applyUpdate = this.applyUpdate.bind(this);
    this.commitUpdate = this.commitUpdate.bind(this);
  }

  /**
   * @internal
   */
  getStoreData(): RelayStoreData {
    return this._storeData;
  }

  /**
   * @internal
   */
  injectDefaultNetworkLayer(networkLayer: ?NetworkLayer) {
    this._storeData.getNetworkLayer().injectDefaultImplementation(networkLayer);
  }

  injectNetworkLayer(networkLayer: ?NetworkLayer) {
    this._storeData.getNetworkLayer().injectImplementation(networkLayer);
  }

  /**
   * @internal
   */
  injectQueryTracker(queryTracker: ?RelayQueryTracker) {
    this._storeData.injectQueryTracker(queryTracker);
  }

  addNetworkSubscriber(
    queryCallback?: ?QueryCallback,
    mutationCallback?: ?MutationCallback
  ): ChangeSubscription {
    return this._storeData.getNetworkLayer().addNetworkSubscriber(
      queryCallback,
      mutationCallback
    );
  }

  injectTaskScheduler(scheduler: ?TaskScheduler): void {
    this._storeData.injectTaskScheduler(scheduler);
  }

  injectCacheManager(cacheManager: ?CacheManager): void {
    this._storeData.injectCacheManager(cacheManager);
  }

  /**
   * Primes the store by sending requests for any missing data that would be
   * required to satisfy the supplied set of queries.
   */
  primeCache(
    querySet: RelayQuerySet,
    callback: ReadyStateChangeCallback
  ): Abortable {
    return this._storeData.getQueryRunner().run(querySet, callback);
  }

  /**
   * Forces the supplied set of queries to be fetched and written to the store.
   * Any data that previously satisfied the queries will be overwritten.
   */
  forceFetch(
    querySet: RelayQuerySet,
    callback: ReadyStateChangeCallback
  ): Abortable {
    return this._storeData.getQueryRunner().forceFetch(querySet, callback);
  }

  /**
   * Reads query data anchored at the supplied data ID.
   */
  read(
    node: RelayQuery.Node,
    dataID: DataID,
    options?: StoreReaderOptions
  ): ?StoreReaderData {
    return readRelayQueryData(this._storeData, node, dataID, options).data;
  }

  /**
   * Reads query data anchored at the supplied data IDs.
   */
  readAll(
    node: RelayQuery.Node,
    dataIDs: Array<DataID>,
    options?: StoreReaderOptions
  ): Array<?StoreReaderData> {
    return dataIDs.map(
      dataID => readRelayQueryData(this._storeData, node, dataID, options).data
    );
  }

  /**
   * Reads query data, where each element in the result array corresponds to a
   * root call argument. If the root call has no arguments, the result array
   * will contain exactly one element.
   */
  readQuery(
    root: RelayQuery.Root,
    options?: StoreReaderOptions
  ): Array<?StoreReaderData> {
    const queuedStore = this._storeData.getQueuedStore();
    const storageKey = root.getStorageKey();
    const results = [];
    forEachRootCallArg(root, ({identifyingArgKey}) => {
      let data;
      const dataID = queuedStore.getDataID(storageKey, identifyingArgKey);
      if (dataID != null) {
        data = this.read(root, dataID, options);
      }
      results.push(data);
    });
    return results;
  }

  /**
   * Reads and subscribes to query data anchored at the supplied data ID. The
   * returned observable emits updates as the data changes over time.
   */
  observe(
    fragment: RelayQuery.Fragment,
    dataID: DataID
  ): Observable<?StoreReaderData> {
    return new RelayQueryResultObservable(this._storeData, fragment, dataID);
  }

  /**
   * @internal
   *
   * Returns a fragment "resolver" - a subscription to the results of a fragment
   * and a means to access the latest results. This is a transitional API and
   * not recommended for general use.
   */
  getFragmentResolver(
    fragment: RelayQuery.Fragment,
    onNext: () => void
  ): FragmentResolver {
    return new GraphQLStoreQueryResolver(
      this._storeData,
      fragment,
      onNext
    );
  }

  /**
   * Adds an update to the store without committing it. The returned
   * RelayMutationTransaction can be committed or rolled back at a later time.
   */
  applyUpdate(
    mutation: RelayMutation<any>,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): RelayMutationTransaction {
    mutation.bindEnvironment(this);
    return this._storeData.getMutationQueue()
      .createTransaction(mutation, callbacks)
      .applyOptimistic();
  }

  /**
   * Adds an update to the store and commits it immediately. Returns
   * the RelayMutationTransaction.
   */
  commitUpdate(
    mutation: RelayMutation<any>,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): RelayMutationTransaction {
    const transaction = this.applyUpdate(mutation, callbacks);
    // The idea here is to defer the call to `commit()` to give the optimistic
    // mutation time to flush out to the UI before starting the commit work.
    const preCommitStatus = transaction.getStatus();
    setTimeout(() => {
      if (transaction.getStatus() !== preCommitStatus) {
        return;
      }
      transaction.commit();
    });
    return transaction;
  }

  /**
   * @deprecated
   *
   * Method renamed to commitUpdate
   */
  update(
    mutation: RelayMutation<any>,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): void {
    warning(
      false,
      '`Relay.Store.update` is deprecated. Please use' +
      ' `Relay.Store.commitUpdate` or `Relay.Store.applyUpdate` instead.'
    );
    this.commitUpdate(mutation, callbacks);
  }
}

/**
 * RelayQuery mutates the `__cachedFragment__` property of concrete nodes for
 * memoization purposes, so a snapshot cannot be completely frozen. Instead this
 * function shallow-freezes the snapshot itself and deeply freezes all
 * properties except the `node`.
 */
function deepFreezeSnapshot(snapshot: Snapshot): Snapshot {
  Object.freeze(snapshot);
  if (snapshot.data != null) {
    deepFreeze(snapshot.data);
  }
  deepFreeze(snapshot.seenRecords);
  deepFreeze(snapshot.variables);
  return snapshot;
}

module.exports = RelayEnvironment;
