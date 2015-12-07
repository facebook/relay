/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLQueryRunner
 * @typechecks
 * @flow
 */

'use strict';

const DliteFetchModeConstants = require('DliteFetchModeConstants');
import type {RelayQuerySet} from 'RelayInternalTypes';
import type {PendingFetch} from 'RelayPendingQueryTracker';
const RelayNetworkLayer = require('RelayNetworkLayer');
const RelayProfiler = require('RelayProfiler');
import type RelayQuery from 'RelayQuery';
import type RelayStoreData from 'RelayStoreData';
const RelayTaskScheduler = require('RelayTaskScheduler');

const checkRelayQueryData = require('checkRelayQueryData');
const diffRelayQuery = require('diffRelayQuery');
const everyObject = require('everyObject');
const flattenSplitRelayQueries = require('flattenSplitRelayQueries');
const forEachObject = require('forEachObject');
const generateForceIndex = require('generateForceIndex');
const invariant = require('invariant');
const mapObject = require('mapObject');
const resolveImmediate = require('resolveImmediate');
const someObject = require('someObject');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');
const warning = require('warning');

import type {
  Abortable,
  ReadyStateChangeCallback,
} from 'RelayTypes';

type PartialReadyState = {
  aborted?: boolean;
  done?: boolean;
  error?: Error;
  ready?: boolean;
  stale?: boolean;
};
type RelayProfileHandler = {stop: () => void};

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
class GraphQLQueryRunner {
  _storeData: RelayStoreData;

  constructor(storeData: RelayStoreData) {
    this._storeData = storeData;
  }

  /**
   * Fetches data required to resolve a set of queries. See the `RelayStore`
   * module for documentation on the callback.
   *
   * Fetch mode must be a value in `DliteFetchModeConstants`.
   */
  run(
    querySet: RelayQuerySet,
    callback: ReadyStateChangeCallback,
    fetchMode?: string
  ): Abortable {
    fetchMode = fetchMode || DliteFetchModeConstants.FETCH_MODE_CLIENT;
    var profiler = fetchMode === DliteFetchModeConstants.FETCH_MODE_REFETCH ?
      RelayProfiler.profile('GraphQLQueryRunner.forceFetch') :
      RelayProfiler.profile('GraphQLQueryRunner.primeCache');

    var diffQueries = [];
    if (fetchMode === DliteFetchModeConstants.FETCH_MODE_CLIENT) {
      forEachObject(querySet, query => {
        if (query) {
          diffQueries.push(...diffRelayQuery(
            query,
            this._storeData.getRecordStore(),
            this._storeData.getQueryTracker()
          ));
        }
      });
    } else {
      forEachObject(querySet, query => {
        if (query) {
          diffQueries.push(query);
        }
      });
    }

    return runQueries(
      this._storeData,
      diffQueries,
      callback,
      fetchMode,
      profiler
    );
  }

  /**
   * Ignores the cache and fetches data required to resolve a set of queries.
   * Uses the data we get back from the server to overwrite data in the cache.
   *
   * Even though we're ignoring the cache, we will still invoke the callback
   * immediately with `ready: true` if `querySet` can be resolved by the cache.
   */
  forceFetch(
    querySet: RelayQuerySet,
    callback: ReadyStateChangeCallback
  ): Abortable {
    var fetchMode = DliteFetchModeConstants.FETCH_MODE_REFETCH;
    var profiler = RelayProfiler.profile('GraphQLQueryRunner.forceFetch');
    var queries = [];
    forEachObject(querySet, query => {
      query && queries.push(query);
    });

    return runQueries(this._storeData, queries, callback, fetchMode, profiler);
  }
}

function hasItems(map: Object): boolean {
  return !!Object.keys(map).length;
}

function splitAndFlattenQueries(
  queries: Array<RelayQuery.Root>
): Array<RelayQuery.Root> {
  if (!RelayNetworkLayer.supports('defer')) {
    if (__DEV__) {
      queries.forEach(query => {
        warning(
          !query.hasDeferredDescendant(),
          'Relay: Query `%s` contains a deferred fragment (e.g. ' +
          '`getFragment(\'foo\').defer()`) which is not supported by the ' +
          'default network layer. This query will be sent without deferral.',
          query.getName()
        );
      });
    }
    return queries;
  }

  var flattenedQueries = [];
  queries.forEach(query => {
    return flattenedQueries.push(
      ...flattenSplitRelayQueries(
        splitDeferredRelayQueries(query)
      )
    );
  });
  return flattenedQueries;
}

function runQueries(
  storeData: RelayStoreData,
  queries: Array<RelayQuery.Root>,
  callback: ReadyStateChangeCallback,
  fetchMode: string,
  profiler: RelayProfileHandler
): Abortable {
  var readyState = {
    aborted: false,
    done: false,
    error: null,
    ready: false,
    stale: false,
  };
  var scheduled = false;
  function setReadyState(partial: PartialReadyState): void {
    if (readyState.aborted) {
      return;
    }
    if (readyState.done || readyState.error) {
      invariant(
        partial.aborted,
        'GraphQLQueryRunner: Unexpected ready state change.'
      );
      return;
    }
    readyState = {
      aborted: partial.aborted != null ? partial.aborted : readyState.aborted,
      done: partial.done != null ? partial.done : readyState.done,
      error: partial.error != null ? partial.error : readyState.error,
      ready: partial.ready != null ? partial.ready : readyState.ready,
      stale: partial.stale != null ? partial.stale : readyState.stale,
    };
    if (scheduled) {
      return;
    }
    scheduled = true;
    resolveImmediate(() => {
      scheduled = false;
      callback(readyState);
    });
  }

  var remainingFetchMap: {[queryID: string]: PendingFetch} = {};
  var remainingRequiredFetchMap: {[queryID: string]: PendingFetch} = {};

  function onResolved(pendingFetch: PendingFetch) {
    var pendingQuery = pendingFetch.getQuery();
    var pendingQueryID = pendingQuery.getID();
    delete remainingFetchMap[pendingQueryID];
    if (!pendingQuery.isDeferred()) {
      delete remainingRequiredFetchMap[pendingQueryID];
    }

    if (hasItems(remainingRequiredFetchMap)) {
      return;
    }

    if (someObject(remainingFetchMap, query => query.isResolvable())) {
      // The other resolvable query will resolve imminently and call
      // `setReadyState` instead.
      return;
    }

    if (hasItems(remainingFetchMap)) {
      setReadyState({done: false, ready: true, stale: false});
    } else {
      setReadyState({done: true, ready: true, stale: false});
    }
  }

  function onRejected(pendingFetch: PendingFetch, error: Error) {
    setReadyState({error});

    var pendingQuery = pendingFetch.getQuery();
    var pendingQueryID = pendingQuery.getID();
    delete remainingFetchMap[pendingQueryID];
    if (!pendingQuery.isDeferred()) {
      delete remainingRequiredFetchMap[pendingQueryID];
    }
  }

  function canResolve(fetch: PendingFetch): boolean {
    return checkRelayQueryData(
      storeData.getQueuedStore(),
      fetch.getQuery()
    );
  }

  RelayTaskScheduler.enqueue(() => {
    var forceIndex = fetchMode === DliteFetchModeConstants.FETCH_MODE_REFETCH ?
      generateForceIndex() : null;

    splitAndFlattenQueries(queries).forEach(query => {
      var pendingFetch = storeData.getPendingQueryTracker().add(
        {query, fetchMode, forceIndex, storeData}
      );
      var queryID = query.getID();
      remainingFetchMap[queryID] = pendingFetch;
      if (!query.isDeferred()) {
        remainingRequiredFetchMap[queryID] = pendingFetch;
      }
      pendingFetch.getResolvedPromise().then(
        onResolved.bind(null, pendingFetch),
        onRejected.bind(null, pendingFetch)
      );
    });

    if (!hasItems(remainingFetchMap)) {
      setReadyState({done: true, ready: true});
    } else {
      if (!hasItems(remainingRequiredFetchMap)) {
        setReadyState({ready: true});
      } else {
        setReadyState({ready: false});
        resolveImmediate(() => {
          if (storeData.hasCacheManager()) {
            var requiredQueryMap = mapObject(
              remainingRequiredFetchMap,
              value => value.getQuery()
            );
            storeData.readFromDiskCache(requiredQueryMap, {
              onSuccess: () => {
                if (hasItems(remainingRequiredFetchMap)) {
                  setReadyState({ready: true, stale: true});
                }
              },
            });
          } else {
            if (everyObject(remainingRequiredFetchMap, canResolve)) {
              if (hasItems(remainingRequiredFetchMap)) {
                setReadyState({ready: true, stale: true});
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
    abort(): void {
      setReadyState({aborted: true});
    },
  };
}

module.exports = GraphQLQueryRunner;
