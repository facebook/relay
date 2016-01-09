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
import type {GarbageCollectionScheduler} from 'RelayGarbageCollector';
import type RelayMutation from 'RelayMutation';
import type RelayMutationTransaction from 'RelayMutationTransaction';
import type RelayQuery from 'RelayQuery';
const RelayQueryResultObservable = require('RelayQueryResultObservable');
const RelayStoreData = require('RelayStoreData');

const forEachRootCallArg = require('forEachRootCallArg');
const readRelayQueryData = require('readRelayQueryData');
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

  constructor(storeData: RelayStoreData) {
    this._storeData = storeData;
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

  /**
   * Adds an update to the store without committing it. The returned
   * RelayMutationTransaction can be committed or rolled back at a later time.
   */
  applyUpdate(
    mutation: RelayMutation,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): RelayMutationTransaction {
    return this._storeData.getMutationQueue().createTransaction(
      mutation,
      callbacks
    );
  }

  /**
   * Adds an update to the store and commits it immediately. Returns
   * the RelayMutationTransaction.
   */
  commitUpdate(
    mutation: RelayMutation,
    callbacks?: RelayMutationTransactionCommitCallbacks
  ): RelayMutationTransaction {
    const transaction = this.applyUpdate(mutation, callbacks);
    transaction.commit();
    return transaction;
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
      '`RelayContext.update` is deprecated. Please use' +
      ' `RelayContext.commitUpdate` or `RelayContext.applyUpdate` instead.'
    );
    this.commitUpdate(mutation, callbacks);
  }

  /**
   * Creates a garbage collector for this instance. After initialization all
   * newly added DataIDs will be registered in the created garbage collector.
   * This will show a warning if data has already been added to the instance.
   */
  initializeGarbageCollection(scheduler: GarbageCollectionScheduler): void {
    this._storeData.initializeGarbageCollector(scheduler);
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
