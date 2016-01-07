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

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const ReactDOM = require('ReactDOM');
import type RelayMutation from 'RelayMutation';
import type RelayMutationTransaction from 'RelayMutationTransaction';
import type RelayQuery from 'RelayQuery';
const RelayQueryResultObservable = require('RelayQueryResultObservable');
const RelayStoreData = require('RelayStoreData');
const RelayTaskScheduler = require('RelayTaskScheduler');

const forEachRootCallArg = require('forEachRootCallArg');
const invariant = require('invariant');
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

/**
 * @public
 *
 * RelayContext is a caching layer that records GraphQL response data and enables
 * resolving and subscribing to queries.
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

  constructor() {
    this._storeData = new RelayStoreData();

    this.injectBatchingStrategy(ReactDOM.unstable_batchedUpdates);
  }

  injectBatchingStrategy(batchStrategy: (callback: Function) => void): void {
    this._storeData.getChangeEmitter().injectBatchingStrategy(batchStrategy);
  }

  /**
   * @internal
   */
  getStoreData(): RelayStoreData {
    return this._storeData;
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
    return this._storeData.read(node, dataID, options);
  }

  /**
   * Reads query data anchored at the supplied data IDs.
   */
  readAll(
    node: RelayQuery.Node,
    dataIDs: Array<DataID>,
    options?: StoreReaderOptions
  ): Array<?StoreReaderData> {
    return this._storeData.readAll(node, dataIDs, options);
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
    const results = [];
    forEachRootCallArg(root, identifyingArgValue => {
      let data;
      const dataID = this._storeData.getQueuedStore()
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
    const fragmentPointer = new GraphQLFragmentPointer(
      fragment.isPlural()? [dataID] : dataID,
      fragment
    );
    return new RelayQueryResultObservable(this._storeData, fragmentPointer);
  }

  applyUpdate(
    mutation: RelayMutation,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): RelayMutationTransaction {
    return this._storeData.getMutationQueue().createTransaction(
      mutation,
      callbacks
    );
  }

  update(
    mutation: RelayMutation,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): void {
    this.applyUpdate(mutation, callbacks).commit();
  }

  /**
   * Initializes garbage collection: must be called before any records are
   * fetched. When records are collected after calls to `scheduleCollection` or
   * `scheduleCollectionFromNode`, records are collected in steps, with a
   * maximum of `stepLength` records traversed in a step. Steps are scheduled
   * via `RelayTaskScheduler`.
   */
  initializeGarbageCollector(stepLength: number): void {
    invariant(
        stepLength > 0,
        'RelayGarbageCollection: step length must be greater than zero, got ' +
        '`%s`.',
        stepLength
    );
    this._storeData.initializeGarbageCollector(scheduler);

    const pendingQueryTracker = this._storeData.getPendingQueryTracker();

    function scheduler(run: () => boolean): void {
      const runIteration = () => {
        // TODO: #9366746: integrate RelayRenderer/Container with GC hold
        warning(
          !pendingQueryTracker.hasPendingQueries(),
          'RelayGarbageCollection: GC is executing during a fetch, but the ' +
          'pending query may rely on data that is collected.'
        );
        let iterations = 0;
        let hasNext = true;
        while (hasNext && (stepLength < 0 || iterations < stepLength)) {
          hasNext = run();
          iterations++;
        }
        // This is effectively a (possibly async) `while` loop
        if (hasNext) {
          RelayTaskScheduler.enqueue(runIteration);
        }
      };
      RelayTaskScheduler.enqueue(runIteration);
    }
  }

  /**
   * Collects any un-referenced records in the store.
   */
  scheduleGarbageCollection(): void {
    const garbageCollector = this._storeData.getGarbageCollector();

    if (garbageCollector) {
      garbageCollector.collect();
    }
  }

  /**
   * Collects any un-referenced records reachable from the given record via
   * graph traversal of fields.
   *
   * NOTE: If the given record is still referenced, no records are collected.
   */
  scheduleGarbageCollectionFromNode(dataID: DataID): void {
    const garbageCollector = this._storeData.getGarbageCollector();

    if (garbageCollector) {
      garbageCollector.collectFromNode(dataID);
    }
  }
}

module.exports = RelayContext;
