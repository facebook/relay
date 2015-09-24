/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayPendingQueryTracker
 * @typechecks
 * @flow
 */

'use strict';

var Deferred = require('Deferred');
var DliteFetchModeConstants = require('DliteFetchModeConstants');
var GraphQLDeferredQueryTracker = require('GraphQLDeferredQueryTracker');
var Promise = require('Promise');
var PromiseMap = require('PromiseMap');
import type RelayQuery from 'RelayQuery';
import type RelayStoreData from 'RelayStoreData';
var RelayTaskScheduler = require('RelayTaskScheduler');
import type {QueryResult} from 'RelayTypes';

var containsRelayQueryRootCall = require('containsRelayQueryRootCall');
var everyObject = require('everyObject');
var fetchRelayQuery = require('fetchRelayQuery');
var invariant = require('invariant');
var subtractRelayQuery = require('subtractRelayQuery');

type PendingQueryParameters = {
  fetchMode: DliteFetchModeConstants;
  forceIndex: ?number;
  query: RelayQuery.Root;
  storeData: RelayStoreData;
};
type PendingState = {
  fetch: PendingFetch;
  query: RelayQuery.Root;
};

var pendingFetchMap: {[queryID: string]: PendingState} = {};

// Asynchronous mapping from preload query IDs to results.
var preloadQueryMap: PromiseMap<Object, Error> = new PromiseMap();

class PendingFetch {
  _query: RelayQuery.Root;

  _forceIndex: ?number;

  _dependents: Array<PendingFetch>;
  _pendingDependencyMap: {[queryID: string]: PendingFetch};

  _fetchedSubtractedQuery: boolean;
  _fetchSubtractedQueryPromise: Promise;

  _resolvedSubtractedQuery: boolean;
  _resolvedDeferred: Deferred<void, ?Error>;

  _storeData: RelayStoreData;

  /**
   * Error(s) in fetching/handleUpdate-ing its or one of its pending
   * dependency's subtracted query. There may be more than one error. However,
   * `_resolvedDeferred` is rejected with the earliest encountered error.
   */
  _errors: Array<?Error>;

  constructor(
    {fetchMode, forceIndex, query, storeData}: PendingQueryParameters
  ) {
    var queryID = query.getID();
    this._storeData = storeData;
    this._query = query;
    this._forceIndex = forceIndex;

    this._resolvedSubtractedQuery = false;
    this._resolvedDeferred = new Deferred();

    this._dependents = [];
    this._pendingDependencyMap = {};

    var subtractedQuery;
    if (fetchMode === DliteFetchModeConstants.FETCH_MODE_PRELOAD) {
      subtractedQuery = query;
      this._fetchSubtractedQueryPromise = preloadQueryMap.get(queryID);
    } else {
      subtractedQuery = this._subtractPending(query);
      this._fetchSubtractedQueryPromise = subtractedQuery ?
        fetchRelayQuery(subtractedQuery) :
        Promise.resolve();
    }

    this._fetchedSubtractedQuery = !subtractedQuery;
    this._errors = [];

    if (subtractedQuery) {
      pendingFetchMap[queryID] = {
        fetch: this,
        query: subtractedQuery,
      };
      GraphQLDeferredQueryTracker.recordQuery(subtractedQuery);
      this._fetchSubtractedQueryPromise.done(
        this._handleSubtractedQuerySuccess.bind(this, subtractedQuery),
        this._handleSubtractedQueryFailure.bind(this, subtractedQuery)
      );
    } else {
      this._markSubtractedQueryAsResolved();
    }
  }

  /**
   * Subtracts all pending queries from the supplied `query` and returns the
   * resulting difference. The difference can be null if the entire query is
   * pending.
   *
   * If any pending queries were subtracted, they will be added as dependencies
   * and the query will only resolve once the subtracted query and all
   * dependencies have resolved.
   *
   * This, combined with our use of diff queries (see `diffRelayQuery`) means
   * that we only go to the server for things that are not in (or not on their
   * way to) the cache (`RelayRecordStore`).
   */
  _subtractPending(query: ?RelayQuery.Root): ?RelayQuery.Root {
    everyObject(pendingFetchMap, pending => {
      // Stop if the entire query is subtracted.
      if (!query) {
        return false;
      }
      if (containsRelayQueryRootCall(pending.query, query)) {
        var subtractedQuery = subtractRelayQuery(query, pending.query);
        if (subtractedQuery !== query) {
          query = subtractedQuery;
          this._addPendingDependency(pending.fetch);
        }
      }
      return true;
    });
    return query;
  }

  _addPendingDependency(pendingFetch: PendingFetch): void {
    var queryID = pendingFetch.getQuery().getID();
    this._pendingDependencyMap[queryID] = pendingFetch;
    pendingFetch._addDependent(this);
  }

  _addDependent(pendingFetch: PendingFetch): void {
    this._dependents.push(pendingFetch);
  }

  _handleSubtractedQuerySuccess(
    subtractedQuery: RelayQuery.Root,
    result: QueryResult
  ): void {
    this._fetchedSubtractedQuery = true;

    RelayTaskScheduler.await(() => {
      var response = result.response;
      invariant(
        response && typeof response === 'object',
        'RelayPendingQueryTracker: Expected response to be an object, got ' +
        '`%s`.',
        response ? typeof response : response
      );
      this._storeData.handleQueryPayload(
        subtractedQuery,
        response,
        this._forceIndex
      );
      GraphQLDeferredQueryTracker.resolveQuery(
        subtractedQuery,
        response,
        result.ref_params
      );
    }).done(
      this._markSubtractedQueryAsResolved.bind(this),
      this._markAsRejected.bind(this)
    );
  }

  _handleSubtractedQueryFailure(
    subtractedQuery: RelayQuery.Root,
    error: Error
  ): void {
    GraphQLDeferredQueryTracker.rejectQuery(subtractedQuery, error);

    this._markAsRejected(error);
  }

  _markSubtractedQueryAsResolved(): void {
    var queryID = this.getQuery().getID();
    delete pendingFetchMap[queryID];

    this._resolvedSubtractedQuery = true;
    this._updateResolvedDeferred();

    this._dependents.forEach(dependent =>
      dependent._markDependencyAsResolved(queryID)
    );
  }

  _markAsRejected(error: Error): void {
    var queryID = this.getQuery().getID();
    delete pendingFetchMap[queryID];

    console.warn(error.message);

    this._errors.push(error);
    this._updateResolvedDeferred();

    this._dependents.forEach(dependent =>
      dependent._markDependencyAsRejected(queryID, error)
    );
  }

  _markDependencyAsResolved(dependencyQueryID: string): void {
    delete this._pendingDependencyMap[dependencyQueryID];

    this._updateResolvedDeferred();
  }

  _markDependencyAsRejected(dependencyQueryID: string, error: Error): void {
    delete this._pendingDependencyMap[dependencyQueryID];

    this._errors.push(error);
    this._updateResolvedDeferred();

    // Dependencies further down the graph are either not affected or informed
    // by `dependencyQueryID`.
  }

  _updateResolvedDeferred(): void {
    if (this._isSettled() && !this._resolvedDeferred.isSettled()) {
      if (this._errors.length) {
        this._resolvedDeferred.reject(this._errors[0]);
      } else {
        this._resolvedDeferred.resolve(undefined);
      }
    }
  }

  _isSettled(): boolean {
    return this._errors.length > 0 ||
      (this._resolvedSubtractedQuery && !hasItems(this._pendingDependencyMap));
  }

  getQuery(): RelayQuery.Root {
    return this._query;
  }

  getResolvedPromise(): Promise {
    return this._resolvedDeferred.getPromise();
  }

  /**
   * A pending query is resolvable if it is already resolved or will be resolved
   * imminently (i.e. its subtracted query and the subtracted queries of all its
   * pending dependencies have been fetched).
   */
  isResolvable(): boolean {
    if (this._fetchedSubtractedQuery) {
      return everyObject(
        this._pendingDependencyMap,
        pendingDependency => pendingDependency._fetchedSubtractedQuery
      );
      // Pending dependencies further down the graph either don't affect the
      // result or are already in `_pendingDependencyMap`.
    }
    return false;
  }
}

function hasItems(map: Object): boolean {
  return !!Object.keys(map).length;
}

/**
 * @internal
 *
 * Tracks pending (in-flight) queries.
 *
 * In order to send minimal queries and avoid re-retrieving data,
 * `RelayPendingQueryTracker` maintains a registry of pending queries, and
 * "subtracts" those from any new queries that callers enqueue.
 */
var RelayPendingQueryTracker = {

  /**
   * Used by `GraphQLQueryRunner` to enqueue new queries.
   */
  add(params: PendingQueryParameters): PendingFetch {
    return new PendingFetch(params);
  },

  hasPendingQueries(): boolean {
    return hasItems(pendingFetchMap);
  },

  /**
   * Clears all pending query tracking. Does not cancel the queries themselves.
   */
  resetPending(): void {
    pendingFetchMap = {};
    GraphQLDeferredQueryTracker.reset();
  },

  resolvePreloadQuery(queryID: string, result: Object): void {
    preloadQueryMap.resolveKey(queryID, result);
  },

  rejectPreloadQuery(queryID: string, error: Error): void {
    preloadQueryMap.rejectKey(queryID, error);
  },

  // TODO: Use `export type`.
  PendingFetch,

};

module.exports = RelayPendingQueryTracker;
