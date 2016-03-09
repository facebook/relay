/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

const Deferred = require('Deferred');
const PromiseMap = require('PromiseMap');
const RelayFetchMode = require('RelayFetchMode');
import type {FetchMode} from 'RelayFetchMode';
import type RelayQuery from 'RelayQuery';
import type RelayStoreData from 'RelayStoreData';
import type {QueryResult} from 'RelayTypes';

const containsRelayQueryRootCall = require('containsRelayQueryRootCall');
const everyObject = require('everyObject');
const invariant = require('invariant');
const subtractRelayQuery = require('subtractRelayQuery');

type PendingQueryParameters = {
  fetchMode: FetchMode;
  forceIndex: ?number;
  query: RelayQuery.Root;
};
type PendingState = {
  fetch: PendingFetch;
  query: RelayQuery.Root;
};

/**
 * @internal
 *
 * Tracks pending (in-flight) queries.
 *
 * In order to send minimal queries and avoid re-retrieving data,
 * `RelayPendingQueryTracker` maintains a registry of pending queries, and
 * "subtracts" those from any new queries that callers enqueue.
 */
class RelayPendingQueryTracker {
  _pendingFetchMap: {[queryID: string]: PendingState};
  // Asynchronous mapping from preload query IDs to results.
  _preloadQueryMap: PromiseMap<Object, Error>;
  _storeData: RelayStoreData;

  constructor(storeData: RelayStoreData) {
    this._pendingFetchMap = {};
    this._preloadQueryMap = new PromiseMap();
    this._storeData = storeData;
  }

  /**
   * Used by `GraphQLQueryRunner` to enqueue new queries.
   */
  add(params: PendingQueryParameters): PendingFetch {
    return new PendingFetch(params, {
      pendingFetchMap: this._pendingFetchMap,
      preloadQueryMap: this._preloadQueryMap,
      storeData: this._storeData,
    });
  }

  hasPendingQueries(): boolean {
    return hasItems(this._pendingFetchMap);
  }

  /**
   * Clears all pending query tracking. Does not cancel the queries themselves.
   */
  resetPending(): void {
    this._pendingFetchMap = {};
  }

  resolvePreloadQuery(queryID: string, result: Object): void {
    this._preloadQueryMap.resolveKey(queryID, result);
  }

  rejectPreloadQuery(queryID: string, error: Error): void {
    this._preloadQueryMap.rejectKey(queryID, error);
  }
}

/**
 * @private
 */
class PendingFetch {
  _pendingFetchMap: {[queryID: string]: PendingState};
  _preloadQueryMap: PromiseMap<Object, Error>;
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
    {fetchMode, forceIndex, query}: PendingQueryParameters,
    {pendingFetchMap, preloadQueryMap, storeData}: {
      pendingFetchMap: {[queryID: string]: PendingState};
      preloadQueryMap: PromiseMap<Object, Error>;
      storeData: RelayStoreData;
    }
  ) {
    const queryID = query.getID();
    this._dependents = [];
    this._forceIndex = forceIndex;
    this._pendingDependencyMap = {};
    this._pendingFetchMap = pendingFetchMap;
    this._preloadQueryMap = preloadQueryMap;
    this._query = query;
    this._resolvedDeferred = new Deferred();
    this._resolvedSubtractedQuery = false;
    this._storeData = storeData;

    let subtractedQuery;
    if (fetchMode === RelayFetchMode.PRELOAD) {
      subtractedQuery = query;
      this._fetchSubtractedQueryPromise = this._preloadQueryMap.get(queryID);
    } else {
      subtractedQuery = this._subtractPending(query);
      this._fetchSubtractedQueryPromise = subtractedQuery ?
        storeData.getNetworkLayer().fetchRelayQuery(subtractedQuery) :
        Promise.resolve();
    }

    this._fetchedSubtractedQuery = !subtractedQuery;
    this._errors = [];

    if (subtractedQuery) {
      this._pendingFetchMap[queryID] = {
        fetch: this,
        query: subtractedQuery,
      };
      this._fetchSubtractedQueryPromise.done(
        this._handleSubtractedQuerySuccess.bind(this, subtractedQuery),
        this._handleSubtractedQueryFailure.bind(this, subtractedQuery)
      );
    } else {
      this._markSubtractedQueryAsResolved();
    }
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

  getQuery(): RelayQuery.Root {
    return this._query;
  }

  getResolvedPromise(): Promise {
    return this._resolvedDeferred.getPromise();
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
    everyObject(this._pendingFetchMap, pending => {
      // Stop if the entire query is subtracted.
      if (!query) {
        return false;
      }
      if (containsRelayQueryRootCall(pending.query, query)) {
        const subtractedQuery = subtractRelayQuery(query, pending.query);
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
    const queryID = pendingFetch.getQuery().getID();
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

    this._storeData.getTaskQueue().enqueue(() => {
      const response = result.response;
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
    }).done(
      this._markSubtractedQueryAsResolved.bind(this),
      this._markAsRejected.bind(this)
    );
  }

  _handleSubtractedQueryFailure(
    subtractedQuery: RelayQuery.Root,
    error: Error
  ): void {
    this._markAsRejected(error);
  }

  _markSubtractedQueryAsResolved(): void {
    const queryID = this.getQuery().getID();
    delete this._pendingFetchMap[queryID];

    this._resolvedSubtractedQuery = true;
    this._updateResolvedDeferred();

    this._dependents.forEach(dependent =>
      dependent._markDependencyAsResolved(queryID)
    );
  }

  _markAsRejected(error: Error): void {
    const queryID = this.getQuery().getID();
    delete this._pendingFetchMap[queryID];

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
}

function hasItems(map: Object): boolean {
  return !!Object.keys(map).length;
}

export type {PendingFetch};
module.exports = RelayPendingQueryTracker;
