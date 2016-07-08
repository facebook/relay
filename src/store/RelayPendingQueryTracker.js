/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayPendingQueryTracker
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

const invariant = require('invariant');

type PendingQueryParameters = {
  fetchMode: FetchMode,
  forceIndex: ?number,
  query: RelayQuery.Root,
};
type PendingState = {
  fetch: PendingFetch,
  query: RelayQuery.Root,
};

/**
 * @internal
 *
 * Tracks pending (in-flight) queries.
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

  _fetchedQuery: boolean;
  _fetchQueryPromise: Promise<any>;

  _resolvedQuery: boolean;
  _resolvedDeferred: Deferred<void, ?Error>;

  _storeData: RelayStoreData;

  _error: ?Error;

  constructor(
    {fetchMode, forceIndex, query}: PendingQueryParameters,
    {pendingFetchMap, preloadQueryMap, storeData}: {
      pendingFetchMap: {[queryID: string]: PendingState},
      preloadQueryMap: PromiseMap<Object, Error>,
      storeData: RelayStoreData,
    }
  ) {
    const queryID = query.getID();
    this._forceIndex = forceIndex;
    this._pendingFetchMap = pendingFetchMap;
    this._preloadQueryMap = preloadQueryMap;
    this._query = query;
    this._resolvedDeferred = new Deferred();
    this._resolvedQuery = false;
    this._storeData = storeData;

    this._fetchQueryPromise = fetchMode === RelayFetchMode.PRELOAD
      ? this._preloadQueryMap.get(queryID)
      : storeData.getNetworkLayer().fetchRelayQuery(query);

    this._fetchedQuery = false;
    this._error = null;

    this._pendingFetchMap[queryID] = {
      fetch: this,
      query: query,
    };
    this._fetchQueryPromise.done(
      this._handleQuerySuccess.bind(this),
      this._handleQueryFailure.bind(this),
    );
  }

  isResolvable(): boolean {
    return this._resolvedQuery;
  }

  getQuery(): RelayQuery.Root {
    return this._query;
  }

  getResolvedPromise(): Promise<any> {
    return this._resolvedDeferred.getPromise();
  }

  _handleQuerySuccess(
    result: QueryResult
  ): void {
    this._fetchedQuery = true;

    this._storeData.getTaskQueue().enqueue(() => {
      const response = result.response;
      invariant(
        response && typeof response === 'object',
        'RelayPendingQueryTracker: Expected response to be an object, got ' +
        '`%s`.',
        response ? typeof response : response
      );
      this._storeData.handleQueryPayload(
        this._query,
        response,
        this._forceIndex
      );
    }).done(
      this._markQueryAsResolved.bind(this),
      this._markAsRejected.bind(this)
    );
  }

  _handleQueryFailure(
    error: Error
  ): void {
    this._markAsRejected(error);
  }

  _markQueryAsResolved(): void {
    const queryID = this.getQuery().getID();
    delete this._pendingFetchMap[queryID];

    this._resolvedQuery = true;
    this._updateResolvedDeferred();
  }

  _markAsRejected(error: Error): void {
    const queryID = this.getQuery().getID();
    delete this._pendingFetchMap[queryID];

    console.warn(error.message);

    this._error = error;
    this._updateResolvedDeferred();
  }

  _updateResolvedDeferred(): void {
    if (this._isSettled() && !this._resolvedDeferred.isSettled()) {
      if (this._error) {
        this._resolvedDeferred.reject(this._error);
      } else {
        this._resolvedDeferred.resolve(undefined);
      }
    }
  }

  _isSettled(): boolean {
    return (!!this._error || this._resolvedQuery);
  }
}

function hasItems(map: Object): boolean {
  return !!Object.keys(map).length;
}

export type {PendingFetch};
module.exports = RelayPendingQueryTracker;
