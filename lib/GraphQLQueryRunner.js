/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLQueryRunner
 * @typechecks
 * 
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var RelayFetchMode = require('./RelayFetchMode');

var RelayNetworkLayer = require('./RelayNetworkLayer');
var RelayProfiler = require('./RelayProfiler');

var RelayReadyState = require('./RelayReadyState');

var RelayTaskScheduler = require('./RelayTaskScheduler');

var checkRelayQueryData = require('./checkRelayQueryData');
var diffRelayQuery = require('./diffRelayQuery');
var everyObject = require('fbjs/lib/everyObject');
var flattenSplitRelayQueries = require('./flattenSplitRelayQueries');
var forEachObject = require('fbjs/lib/forEachObject');
var generateForceIndex = require('./generateForceIndex');
var mapObject = require('fbjs/lib/mapObject');
var resolveImmediate = require('fbjs/lib/resolveImmediate');
var someObject = require('fbjs/lib/someObject');
var splitDeferredRelayQueries = require('./splitDeferredRelayQueries');
var warning = require('fbjs/lib/warning');

/**
 * This is the high-level entry point for sending queries to the GraphQL
 * endpoint. It provides methods for scheduling queries (`run`), force-fetching
 * queries (ie. ignoring the cache; `forceFetch`).
 *
 * In order to send minimal queries and avoid re-retrieving data,
 * `GraphQLQueryRunner` maintains a registry of pending (in-flight) queries, and
 * "subtracts" those from any new queries that callers enqueue.
 *
 * @internal
 */

var GraphQLQueryRunner = (function () {
  function GraphQLQueryRunner(storeData) {
    _classCallCheck(this, GraphQLQueryRunner);

    this._storeData = storeData;
  }

  /**
   * Fetches data required to resolve a set of queries. See the `RelayStore`
   * module for documentation on the callback.
   */

  GraphQLQueryRunner.prototype.run = function run(querySet, callback, fetchMode) {
    var _this = this;

    fetchMode = fetchMode || RelayFetchMode.CLIENT;
    var profiler = fetchMode === RelayFetchMode.REFETCH ? RelayProfiler.profile('GraphQLQueryRunner.forceFetch') : RelayProfiler.profile('GraphQLQueryRunner.primeCache');

    var diffQueries = [];
    if (fetchMode === RelayFetchMode.CLIENT) {
      forEachObject(querySet, function (query) {
        if (query) {
          diffQueries.push.apply(diffQueries, _toConsumableArray(diffRelayQuery(query, _this._storeData.getRecordStore(), _this._storeData.getQueryTracker())));
        }
      });
    } else {
      forEachObject(querySet, function (query) {
        if (query) {
          diffQueries.push(query);
        }
      });
    }

    return runQueries(this._storeData, diffQueries, callback, fetchMode, profiler);
  };

  /**
   * Ignores the cache and fetches data required to resolve a set of queries.
   * Uses the data we get back from the server to overwrite data in the cache.
   *
   * Even though we're ignoring the cache, we will still invoke the callback
   * immediately with `ready: true` if `querySet` can be resolved by the cache.
   */

  GraphQLQueryRunner.prototype.forceFetch = function forceFetch(querySet, callback) {
    var fetchMode = RelayFetchMode.REFETCH;
    var profiler = RelayProfiler.profile('GraphQLQueryRunner.forceFetch');
    var queries = [];
    forEachObject(querySet, function (query) {
      query && queries.push(query);
    });

    return runQueries(this._storeData, queries, callback, fetchMode, profiler);
  };

  return GraphQLQueryRunner;
})();

function hasItems(map) {
  return !!_Object$keys(map).length;
}

function splitAndFlattenQueries(queries) {
  if (!RelayNetworkLayer.supports('defer')) {
    if (process.env.NODE_ENV !== 'production') {
      queries.forEach(function (query) {
        process.env.NODE_ENV !== 'production' ? warning(!query.hasDeferredDescendant(), 'Relay: Query `%s` contains a deferred fragment (e.g. ' + '`getFragment(\'foo\').defer()`) which is not supported by the ' + 'default network layer. This query will be sent without deferral.', query.getName()) : undefined;
      });
    }
    return queries;
  }

  var flattenedQueries = [];
  queries.forEach(function (query) {
    return flattenedQueries.push.apply(flattenedQueries, _toConsumableArray(flattenSplitRelayQueries(splitDeferredRelayQueries(query))));
  });
  return flattenedQueries;
}

function runQueries(storeData, queries, callback, fetchMode, profiler) {
  var readyState = new RelayReadyState(callback);

  var remainingFetchMap = {};
  var remainingRequiredFetchMap = {};

  function onResolved(pendingFetch) {
    var pendingQuery = pendingFetch.getQuery();
    var pendingQueryID = pendingQuery.getID();
    delete remainingFetchMap[pendingQueryID];
    if (!pendingQuery.isDeferred()) {
      delete remainingRequiredFetchMap[pendingQueryID];
    }

    if (hasItems(remainingRequiredFetchMap)) {
      return;
    }

    if (someObject(remainingFetchMap, function (query) {
      return query.isResolvable();
    })) {
      // The other resolvable query will resolve imminently and call
      // `readyState.update` instead.
      return;
    }

    if (hasItems(remainingFetchMap)) {
      readyState.update({ done: false, ready: true, stale: false });
    } else {
      readyState.update({ done: true, ready: true, stale: false });
    }
  }

  function onRejected(pendingFetch, error) {
    readyState.update({ error: error });

    var pendingQuery = pendingFetch.getQuery();
    var pendingQueryID = pendingQuery.getID();
    delete remainingFetchMap[pendingQueryID];
    if (!pendingQuery.isDeferred()) {
      delete remainingRequiredFetchMap[pendingQueryID];
    }
  }

  function canResolve(fetch) {
    return checkRelayQueryData(storeData.getQueuedStore(), fetch.getQuery());
  }

  RelayTaskScheduler.enqueue(function () {
    var forceIndex = fetchMode === RelayFetchMode.REFETCH ? generateForceIndex() : null;

    splitAndFlattenQueries(queries).forEach(function (query) {
      var pendingFetch = storeData.getPendingQueryTracker().add({ query: query, fetchMode: fetchMode, forceIndex: forceIndex, storeData: storeData });
      var queryID = query.getID();
      remainingFetchMap[queryID] = pendingFetch;
      if (!query.isDeferred()) {
        remainingRequiredFetchMap[queryID] = pendingFetch;
      }
      pendingFetch.getResolvedPromise().then(onResolved.bind(null, pendingFetch), onRejected.bind(null, pendingFetch));
    });

    if (!hasItems(remainingFetchMap)) {
      readyState.update({ done: true, ready: true });
    } else {
      if (!hasItems(remainingRequiredFetchMap)) {
        readyState.update({ ready: true });
      } else {
        readyState.update({ ready: false });
        resolveImmediate(function () {
          if (storeData.hasCacheManager()) {
            var requiredQueryMap = mapObject(remainingRequiredFetchMap, function (value) {
              return value.getQuery();
            });
            storeData.readFromDiskCache(requiredQueryMap, {
              onSuccess: function onSuccess() {
                if (hasItems(remainingRequiredFetchMap)) {
                  readyState.update({ ready: true, stale: true });
                }
              }
            });
          } else {
            if (everyObject(remainingRequiredFetchMap, canResolve)) {
              if (hasItems(remainingRequiredFetchMap)) {
                readyState.update({ ready: true, stale: true });
              }
            }
          }
        });
      }
    }
    // Stop profiling when queries have been sent to the network layer.
    profiler.stop();
  }).done();

  return {
    abort: function abort() {
      readyState.update({ aborted: true });
    }
  };
}

module.exports = GraphQLQueryRunner;