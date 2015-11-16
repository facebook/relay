/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayContext
 * @typechecks
 * @flow
 */

'use strict';

import type {BatchStrategy} from 'GraphQLStoreChangeEmitter';
var GraphQLFragmentPointer = require('GraphQLFragmentPointer');
var GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
import type {
  GraphQLStoreQueryResolverCallback
} from 'GraphQLStoreQueryResolver';
var RelayDeferredFragmentTracker = require('RelayDeferredFragmentTracker');
import type {
  RelayDeferredFragmentTrackerOptions
} from 'RelayDeferredFragmentTracker';
import type RelayMutation from 'RelayMutation';
import type RelayMutationTransaction from 'RelayMutationTransaction';
var RelayQuery = require('RelayQuery');
var RelayQueryResultObservable = require('RelayQueryResultObservable');
var RelayStoreData = require('RelayStoreData');

var forEachRootCallArg = require('forEachRootCallArg');
var readRelayQueryData = require('readRelayQueryData');

import type {
  Abortable,
  Observable,
  RelayMutationTransactionCommitCallbacks,
  ReadyStateChangeCallback,
  StoreReaderData,
  StoreReaderOptions
} from 'RelayTypes';

import type {
  DataID,
  RelayQuerySet
} from 'RelayInternalTypes';

/**
 * @public
 *
 * RelayContext is a caching layer that records GraphQL response data and
 * enables resolving and subscribing to queries.
 *
 * === onReadyStateChange ===
 *
 * Whenever Relay sends a request for data via GraphQL, an "onReadyStateChange"
 * callback can be supplied. This callback is called one or more times with a
 * `readyState` object with the following properties:
 *
 *   aborted: Whether the request was aborted.
 *   done: Whether all response data has been fetched.
 *   error: An error in the event of a failure, or null if none.
 *   ready: Whether the queries are at least partially resolvable.
 *   stale: When resolvable during `forceFetch`, whether data is stale.
 *
 * If the callback is invoked with `aborted`, `done`, or a non-null `error`, the
 * callback will never be called again. Example usage:
 *
 *  function onReadyStateChange(readyState) {
 *    if (readyState.aborted) {
 *      // Request was aborted.
 *    } else if (readyState.error) {
 *      // Failure occurred.
 *    } else if (readyState.ready) {
 *      // Queries are at least partially resolvable.
 *      if (readyState.done) {
 *        // Queries are completely resolvable.
 *      }
 *    }
 *  }
 *
 */
class RelayContext {
  _storeData: RelayStoreData;

  constructor(storeData: ?RelayStoreData) {
    this._storeData = storeData || new RelayStoreData();
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
    const storageKey = root.getStorageKey();
    var results = [];
    forEachRootCallArg(root, identifyingArgValue => {
      var data;
      var dataID = this._storeData.getQueuedStore()
        .getDataID(storageKey, identifyingArgValue);
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
    var fragmentPointer = new GraphQLFragmentPointer(
      fragment.isPlural()? [dataID] : dataID,
      fragment
    );
    return new RelayQueryResultObservable(this._storeData, fragmentPointer);
  }

  update(
    mutation: RelayMutation,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): void {
    mutation._resolveProps(this);
    var transaction = this._storeData.getMutationQueue().createTransaction(
      mutation,
      callbacks
    );
    transaction.commit();
  }

  createQueryResolver(
    fragmentPointer: GraphQLFragmentPointer,
    callback: GraphQLStoreQueryResolverCallback
  ): GraphQLStoreQueryResolver {
    return new GraphQLStoreQueryResolver(
      this._storeData,
      fragmentPointer,
      callback
    );
  }

  createFragmentQueryForDataID(
    fragment: RelayQuery.Fragment,
    dataID: DataID
  ): RelayQuery.Root {
    return this._storeData.buildFragmentQueryForDataID(fragment, dataID);
  }

  createFragmentPointerForRoot(
    root: RelayQuery.Root
  ): any {
    return root ? GraphQLFragmentPointer.createForRoot(
      this._storeData.getQueuedStore(),
      root
    ) :
    null;
  }

  createDeferredFragmentTracker(
    options: RelayDeferredFragmentTrackerOptions
  ): RelayDeferredFragmentTracker {
    return new RelayDeferredFragmentTracker(
      this._storeData.getDeferredQueryTracker(),
      this._storeData.getPendingQueryTracker(),
      options
    );
  }

  getPendingMutationTransactions(
    dataID: DataID
  ): ?Array<RelayMutationTransaction> {
    const mutationIDs = this._storeData.getClientMutationIDs(dataID);
    if (!mutationIDs) {
      return null;
    }
    const mutationQueue = this._storeData.getMutationQueue();
    return mutationIDs.map(id => mutationQueue.getTransaction(id));
  }

  hasOptimisticUpdate(
    dataID: DataID
  ): boolean {
    return this._storeData.hasOptimisticUpdate(dataID);
  }

  injectBatchingStrategy(
    batchStrategy: BatchStrategy
  ): void {
    this._storeData.getChangeEmitter().injectBatchingStrategy(batchStrategy);
  }
}

module.exports = RelayContext;
