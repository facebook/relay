/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLQueryRunner
 * @flow
 * @format
 */

'use strict';

const RelayFetchMode = require('RelayFetchMode');
const RelayProfiler = require('RelayProfiler');
const RelayReadyState = require('RelayReadyState');

const checkRelayQueryData = require('checkRelayQueryData');
const diffRelayQuery = require('diffRelayQuery');
const everyObject = require('everyObject');
const flattenSplitRelayQueries = require('flattenSplitRelayQueries');
const forEachObject = require('forEachObject');
const generateForceIndex = require('generateForceIndex');
const mapObject = require('mapObject');
const resolveImmediate = require('resolveImmediate');
const someObject = require('someObject');
const splitDeferredRelayQueries = require('splitDeferredRelayQueries');
const throwFailedPromise = require('throwFailedPromise');
const warning = require('warning');

import type {FetchMode} from 'RelayFetchMode';
import type {RelayQuerySet} from 'RelayInternalTypes';
import type {PendingFetch} from 'RelayPendingQueryTracker';
import type RelayQuery from 'RelayQuery';
import type RelayStoreData from 'RelayStoreData';
import type {Abortable, ReadyStateChangeCallback} from 'RelayTypes';

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
   */
  run(
    querySet: RelayQuerySet,
    callback: ReadyStateChangeCallback,
    fetchMode?: FetchMode = RelayFetchMode.CLIENT,
  ): Abortable {
    return runQueries(this._storeData, querySet, callback, fetchMode);
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
    callback: ReadyStateChangeCallback,
  ): Abortable {
    const fetchMode = RelayFetchMode.REFETCH;
    return runQueries(this._storeData, querySet, callback, fetchMode);
  }
}

function hasItems(map: Object): boolean {
  return !!Object.keys(map).length;
}

function splitAndFlattenQueries(
  storeData: RelayStoreData,
  queries: Array<RelayQuery.Root>,
): Array<RelayQuery.Root> {
  if (!storeData.getNetworkLayer().supports('defer')) {
    if (__DEV__) {
      queries.forEach(query => {
        warning(
          !query.hasDeferredDescendant(),
          'Relay: Query `%s` contains a deferred fragment (e.g. ' +
            "`getFragment('foo').defer()`) which is not supported by the " +
            'default network layer. This query will be sent without deferral.',
          query.getName(),
        );
      });
    }
    return queries;
  }

  const flattenedQueries = [];
  queries.forEach(query => {
    return flattenedQueries.push(
      ...flattenSplitRelayQueries(splitDeferredRelayQueries(query)),
    );
  });
  return flattenedQueries;
}

function runQueries(
  storeData: RelayStoreData,
  querySet: RelayQuerySet,
  callback: ReadyStateChangeCallback,
  fetchMode: FetchMode,
): Abortable {
  const profiler = fetchMode === RelayFetchMode.REFETCH
    ? RelayProfiler.profile('GraphQLQueryRunner.forceFetch')
    : RelayProfiler.profile('GraphQLQueryRunner.primeCache');

  const readyState = new RelayReadyState(callback);

  const remainingFetchMap: {[queryID: string]: PendingFetch} = {};
  const remainingRequiredFetchMap: {[queryID: string]: PendingFetch} = {};

  function onResolved(pendingFetch: PendingFetch) {
    const pendingQuery = pendingFetch.getQuery();
    const pendingQueryID = pendingQuery.getID();
    delete remainingFetchMap[pendingQueryID];
    if (!pendingQuery.isDeferred()) {
      delete remainingRequiredFetchMap[pendingQueryID];
    }

    if (hasItems(remainingRequiredFetchMap)) {
      return;
    }

    if (someObject(remainingFetchMap, query => query.isResolvable())) {
      // The other resolvable query will resolve imminently and call
      // `readyState.update` instead.
      return;
    }

    if (hasItems(remainingFetchMap)) {
      readyState.update(
        {
          done: false,
          ready: true,
          stale: false,
        },
        [{type: 'NETWORK_QUERY_RECEIVED_REQUIRED'}],
      );
    } else {
      readyState.update(
        {
          done: true,
          ready: true,
          stale: false,
        },
        [{type: 'NETWORK_QUERY_RECEIVED_ALL'}],
      );
    }
  }

  function onRejected(pendingFetch: PendingFetch, error: Error) {
    readyState.update({error}, [{type: 'NETWORK_QUERY_ERROR', error}]);
  }

  function canResolve(fetch: PendingFetch): boolean {
    return checkRelayQueryData(storeData.getQueuedStore(), fetch.getQuery());
  }

  throwFailedPromise(
    storeData.getTaskQueue().enqueue(() => {
      const forceIndex = fetchMode === RelayFetchMode.REFETCH
        ? generateForceIndex()
        : null;

      const queries = [];
      if (fetchMode === RelayFetchMode.CLIENT) {
        forEachObject(querySet, query => {
          if (query) {
            queries.push(
              ...diffRelayQuery(
                query,
                storeData.getRecordStore(),
                storeData.getQueryTracker(),
              ),
            );
          }
        });
      } else {
        forEachObject(querySet, query => {
          if (query) {
            queries.push(query);
          }
        });
      }

      const flattenedQueries = splitAndFlattenQueries(storeData, queries);

      const networkEvent = [];
      if (flattenedQueries.length) {
        networkEvent.push({type: 'NETWORK_QUERY_START'});
      }

      flattenedQueries.forEach(query => {
        const pendingFetch = storeData
          .getPendingQueryTracker()
          .add({query, fetchMode, forceIndex, storeData});
        const queryID = query.getID();
        remainingFetchMap[queryID] = pendingFetch;
        if (!query.isDeferred()) {
          remainingRequiredFetchMap[queryID] = pendingFetch;
        }
        pendingFetch
          .getResolvedPromise()
          .then(
            onResolved.bind(null, pendingFetch),
            onRejected.bind(null, pendingFetch),
          );
      });

      if (!hasItems(remainingFetchMap)) {
        readyState.update(
          {
            done: true,
            ready: true,
          },
          [...networkEvent, {type: 'STORE_FOUND_ALL'}],
        );
      } else {
        if (!hasItems(remainingRequiredFetchMap)) {
          readyState.update({ready: true}, [
            ...networkEvent,
            {type: 'STORE_FOUND_REQUIRED'},
          ]);
        } else {
          readyState.update({ready: false}, [
            ...networkEvent,
            {type: 'CACHE_RESTORE_START'},
          ]);

          resolveImmediate(() => {
            if (storeData.hasCacheManager()) {
              const requiredQueryMap = mapObject(
                remainingRequiredFetchMap,
                value => value.getQuery(),
              );
              storeData.restoreQueriesFromCache(requiredQueryMap, {
                onSuccess: () => {
                  readyState.update(
                    {
                      ready: true,
                      stale: true,
                    },
                    [{type: 'CACHE_RESTORED_REQUIRED'}],
                  );
                },
                onFailure: (error: any) => {
                  readyState.update(
                    {
                      error,
                    },
                    [{type: 'CACHE_RESTORE_FAILED', error}],
                  );
                },
              });
            } else {
              if (
                everyObject(remainingRequiredFetchMap, canResolve) &&
                hasItems(remainingRequiredFetchMap)
              ) {
                readyState.update(
                  {
                    ready: true,
                    stale: true,
                  },
                  [{type: 'CACHE_RESTORED_REQUIRED'}],
                );
              } else {
                readyState.update({}, [{type: 'CACHE_RESTORE_FAILED'}]);
              }
            }
          });
        }
      }
      // Stop profiling when queries have been sent to the network layer.
      profiler.stop();
    }),
  );

  return {
    abort(): void {
      readyState.update({aborted: true}, [{type: 'ABORT'}]);
    },
  };
}

module.exports = GraphQLQueryRunner;
