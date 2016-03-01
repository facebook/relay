/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayContext
 * @typechecks
 * 
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var GraphQLStoreQueryResolver = require('./GraphQLStoreQueryResolver');

var RelayQueryResultObservable = require('./RelayQueryResultObservable');
var RelayStoreData = require('./RelayStoreData');

var forEachRootCallArg = require('./forEachRootCallArg');
var readRelayQueryData = require('./readRelayQueryData');
var relayUnstableBatchedUpdates = require('./relayUnstableBatchedUpdates');
var warning = require('fbjs/lib/warning');

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

var RelayContext = (function () {
  function RelayContext() {
    _classCallCheck(this, RelayContext);

    this._storeData = new RelayStoreData();
    this._storeData.getChangeEmitter().injectBatchingStrategy(relayUnstableBatchedUpdates);
  }

  /**
   * @internal
   */

  RelayContext.prototype.getStoreData = function getStoreData() {
    return this._storeData;
  };

  /**
   * Primes the store by sending requests for any missing data that would be
   * required to satisfy the supplied set of queries.
   */

  RelayContext.prototype.primeCache = function primeCache(querySet, callback) {
    return this._storeData.getQueryRunner().run(querySet, callback);
  };

  /**
   * Forces the supplied set of queries to be fetched and written to the store.
   * Any data that previously satisfied the queries will be overwritten.
   */

  RelayContext.prototype.forceFetch = function forceFetch(querySet, callback) {
    return this._storeData.getQueryRunner().forceFetch(querySet, callback);
  };

  /**
   * Resets the store
   */

  RelayContext.prototype.reset = function reset() {
    console.log('test');
    this._storeData = new RelayStoreData();
  };

  /**
   * Reads query data anchored at the supplied data ID.
   */

  RelayContext.prototype.read = function read(node, dataID, options) {
    return readRelayQueryData(this._storeData, node, dataID, options).data;
  };

  /**
   * Reads query data anchored at the supplied data IDs.
   */

  RelayContext.prototype.readAll = function readAll(node, dataIDs, options) {
    var _this = this;

    return dataIDs.map(function (dataID) {
      return readRelayQueryData(_this._storeData, node, dataID, options).data;
    });
  };

  /**
   * Reads query data, where each element in the result array corresponds to a
   * root call argument. If the root call has no arguments, the result array
   * will contain exactly one element.
   */

  RelayContext.prototype.readQuery = function readQuery(root, options) {
    var _this2 = this;

    var queuedStore = this._storeData.getQueuedStore();
    var storageKey = root.getStorageKey();
    var results = [];
    forEachRootCallArg(root, function (identifyingArgValue) {
      var data = undefined;
      var dataID = queuedStore.getDataID(storageKey, identifyingArgValue);
      if (dataID != null) {
        data = _this2.read(root, dataID, options);
      }
      results.push(data);
    });
    return results;
  };

  /**
   * Reads and subscribes to query data anchored at the supplied data ID. The
   * returned observable emits updates as the data changes over time.
   */

  RelayContext.prototype.observe = function observe(fragment, dataID) {
    return new RelayQueryResultObservable(this._storeData, fragment, dataID);
  };

  /**
   * @internal
   *
   * Returns a fragment "resolver" - a subscription to the results of a fragment
   * and a means to access the latest results. This is a transitional API and
   * not recommended for general use.
   */

  RelayContext.prototype.getFragmentResolver = function getFragmentResolver(fragment, onNext) {
    return new GraphQLStoreQueryResolver(this._storeData, fragment, onNext);
  };

  /**
   * Adds an update to the store without committing it. The returned
   * RelayMutationTransaction can be committed or rolled back at a later time.
   */

  RelayContext.prototype.applyUpdate = function applyUpdate(mutation, callbacks) {
    return this._storeData.getMutationQueue().createTransaction(mutation, callbacks);
  };

  /**
   * Adds an update to the store and commits it immediately. Returns
   * the RelayMutationTransaction.
   */

  RelayContext.prototype.commitUpdate = function commitUpdate(mutation, callbacks) {
    var transaction = this.applyUpdate(mutation, callbacks);
    transaction.commit();
    return transaction;
  };

  /**
   * @deprecated
   *
   * Method renamed to commitUpdate
   */

  RelayContext.prototype.update = function update(mutation, callbacks) {
    process.env.NODE_ENV !== 'production' ? warning(false, '`Relay.Store.update` is deprecated. Please use' + ' `Relay.Store.commitUpdate` or `Relay.Store.applyUpdate` instead.') : undefined;
    this.commitUpdate(mutation, callbacks);
  };

  return RelayContext;
})();

module.exports = RelayContext;