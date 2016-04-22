/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayEnvironment
 * @typechecks
 * @flow
 */

'use strict';

const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
import type {ChangeSubscription} from 'RelayInternalTypes';
import type RelayMutation from 'RelayMutation';
import type RelayMutationTransaction from 'RelayMutationTransaction';
import type {MutationCallback, QueryCallback} from 'RelayNetworkLayer';
import type RelayQuery from 'RelayQuery';
const RelayQueryResultObservable = require('RelayQueryResultObservable');
const RelayStoreData = require('RelayStoreData');
import type {TaskScheduler} from 'RelayTaskQueue';
import type {NetworkLayer} from 'RelayTypes';

const forEachRootCallArg = require('forEachRootCallArg');
const readRelayQueryData = require('readRelayQueryData');
const relayUnstableBatchedUpdates = require('relayUnstableBatchedUpdates');
const warning = require('warning');

import type {
  Abortable,
  Observable,
  RelayMutationTransactionCommitCallbacks,
  ReadyStateChangeCallback,
  StoreReaderData,
  StoreReaderOptions,
} from 'RelayTypes';

import type {
  DataID,
  RelayQuerySet,
} from 'RelayInternalTypes';

export type FragmentResolver = {
  dispose: () => void;
  resolve: (
    fragment: RelayQuery.Fragment,
    dataIDs: DataID | Array<DataID>
  ) => ?(StoreReaderData | Array<?StoreReaderData>);
};

export type RelayEnvironmentInterface = {
  forceFetch: (
    querySet: RelayQuerySet,
    onReadyStateChange: ReadyStateChangeCallback
  ) => Abortable;
  getFragmentResolver: (
    fragment: RelayQuery.Fragment,
    onNext: () => void
  ) => FragmentResolver;
  getStoreData: () => RelayStoreData;
  primeCache: (
    querySet: RelayQuerySet,
    onReadyStateChange: ReadyStateChangeCallback
  ) => Abortable;
  read: (
    node: RelayQuery.Node,
    dataID: DataID,
    options?: StoreReaderOptions
  ) => ?StoreReaderData;
};

/**
 * @public
 *
 * `RelayEnvironment` is the public API for Relay core. Each instance provides
 * an isolated environment with:
 * - Methods for fetchng and updating data.
 * - An in-memory cache of fetched data.
 * - A configurable network layer for resolving queries/mutations.
 * - A configurable task scheduler to control when internal tasks are executed.
 * - A configurable cache manager for persisting data between sessions.
 *
 * No data or configuration is shared between instances. We recommend creating
 * one `RelayEnvironment` instance per user: client apps may share a single
 * instance, server apps may create one instance per HTTP request.
 */
class RelayEnvironment {
  _storeData: RelayStoreData;

  constructor() {
    this._storeData = new RelayStoreData();
    this._storeData.getChangeEmitter().injectBatchingStrategy(
      relayUnstableBatchedUpdates
    );
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
    mutation: RelayMutation,
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
    mutation: RelayMutation,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): RelayMutationTransaction {
    return this
      .applyUpdate(mutation, callbacks)
      .commit();
  }

  /**
   * @deprecated
   *
   * Method renamed to commitUpdate
   */
  update(
    mutation: RelayMutation,
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

module.exports = RelayEnvironment;
