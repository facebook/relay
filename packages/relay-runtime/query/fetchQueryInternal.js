/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const Observable = require('../network/RelayObservable');
const RelayReplaySubject = require('../util/RelayReplaySubject');

const getRequestParametersIdentifier = require('../util/getRequestParametersIdentifier');
const invariant = require('invariant');

import type {GraphQLResponse} from '../network/RelayNetworkTypes';
import type {Subscription} from '../network/RelayObservable';
import type {Environment, OperationDescriptor} from '../store/RelayStoreTypes';
import type {RequestParameters} from '../util/RelayConcreteNode';
import type {CacheConfig, Variables} from '../util/RelayRuntimeTypes';
import type {Identifier as RequestParametersId} from '../util/getRequestParametersIdentifier';

type RequestCacheEntry = {|
  +subject: RelayReplaySubject<GraphQLResponse>,
  +subscription: Subscription,
|};

const requestCachesByEnvironment = new Map();

/**
 * Fetches the given query and variables on the provided environment,
 * and de-dupes identical in-flight requests.
 *
 * Observing a request:
 * ====================
 * fetchQuery returns an Observable which you can call .subscribe()
 * on. subscribe() takes an Observer, which you can provide to
 * observe network events:
 *
 * ```
 * fetchQuery(environment, query, variables).subscribe({
 *   // Called when network requests starts
 *   start: (subscription) => {},
 *
 *   // Called after a payload is received and written to the local store
 *   next: (payload) => {},
 *
 *   // Called when network requests errors
 *   error: (error) => {},
 *
 *   // Called when network requests fully completes
 *   complete: () => {},
 *
 *   // Called when network request is unsubscribed
 *   unsubscribe: (subscription) => {},
 * });
 * ```
 *
 * In-flight request de-duping:
 * ============================
 * By default, calling fetchQuery multiple times with the same
 * environment, query and variables will not initiate a new request if a request
 * for those same parameters is already in flight.
 *
 * A request is marked in-flight from the moment it starts until the moment it
 * fully completes, regardless of error or successful completion.
 *
 * NOTE: If the request completes _synchronously_, calling fetchQuery
 * a second time with the same arguments in the same tick will _NOT_ de-dupe
 * the request given that it will no longer be in-flight.
 *
 *
 * Data Retention:
 * ===============
 * This function will not retain any query data outside the scope of the
 * request, which means it is not guaranteed that it won't be garbage
 * collected after the request completes.
 * If you need to retain data, you can do so manually with environment.retain().
 *
 * Cancelling requests:
 * ====================
 * If the subscription returned by subscribe is called while the
 * request is in-flight, apart from releasing retained data, the request will
 * also be cancelled.
 *
 * ```
 * const subscription = fetchQuery(...).subscribe(...);
 *
 * // This will cancel the request if it is in-flight.
 * subscription.unsubscribe();
 * ```
 * @private
 */
function fetchQuery(
  environment: Environment,
  query: OperationDescriptor,
  options?: {|
    networkCacheConfig?: CacheConfig,
  |},
): Observable<GraphQLResponse> {
  return fetchQueryDeduped(
    environment,
    query.node.params,
    query.variables,
    () =>
      environment.execute({
        operation: query,
        cacheConfig: options?.networkCacheConfig,
      }),
  );
}

/**
 * Low-level implementation details of `fetchQuery`.
 *
 * `fetchQueryDeduped` can also be used to share a single cache for
 * requests that aren't using `fetchQuery` directly (e.g. because they don't
 * have an `OperationDescriptor` when they are called).
 *
 * @private
 */
function fetchQueryDeduped(
  environment: Environment,
  parameters: RequestParameters,
  variables: Variables,
  fetchFn: () => Observable<GraphQLResponse>,
): Observable<GraphQLResponse> {
  return Observable.create(sink => {
    const requestCache = getRequestCache(environment);
    const cacheKey = getRequestParametersIdentifier(parameters, variables);
    let cachedRequest = requestCache.get(cacheKey);

    if (!cachedRequest) {
      fetchFn()
        .finally(() => requestCache.delete(cacheKey))
        .subscribe({
          start: subscription => {
            cachedRequest = {
              subject: new RelayReplaySubject(),
              subscription: subscription,
            };
            requestCache.set(cacheKey, cachedRequest);
          },
          next: response => {
            getCachedRequest(requestCache, cacheKey).subject.next(response);
          },
          error: error => {
            getCachedRequest(requestCache, cacheKey).subject.error(error);
          },
          complete: () => {
            getCachedRequest(requestCache, cacheKey).subject.complete();
          },
        });
    }

    invariant(
      cachedRequest != null,
      '[fetchQueryInternal] fetchQueryDeduped: Expected `start` to be ' +
        'called synchronously',
    );
    const subscription = cachedRequest.subject.subscribe(sink);

    return () => {
      subscription.unsubscribe();
      const cachedRequestInstance = requestCache.get(cacheKey);
      if (cachedRequestInstance) {
        const requestSubscription = cachedRequestInstance.subscription;
        if (
          requestSubscription != null &&
          cachedRequestInstance.subject.getObserverCount() === 0
        ) {
          requestSubscription.unsubscribe();
          requestCache.delete(cacheKey);
        }
      }
    };
  });
}

/**
 * If a request is in flight for the given query, variables and environment,
 * this function will return a Promise that will resolve when that request has
 * completed and the data has been saved to the store.
 * If no request is in flight, null will be returned
 * @private
 */
function getPromiseForRequestInFlight(
  environment: Environment,
  query: OperationDescriptor,
): Promise<?GraphQLResponse> | null {
  const requestCache = getRequestCache(environment);
  const cacheKey = getRequestParametersIdentifier(
    query.node.params,
    query.variables,
  );
  const cachedRequest = requestCache.get(cacheKey);
  if (!cachedRequest) {
    return null;
  }

  return new Promise((resolve, reject) => {
    let resolveOnNext = false;
    fetchQuery(environment, query).subscribe({
      complete: resolve,
      error: reject,
      next: response => {
        /*
         * The underlying `RelayReplaySubject` will synchronously replay events
         * as soon as we subscribe, but since we want the *next* asynchronous
         * one, we'll ignore them until the replay finishes.
         */
        if (resolveOnNext) {
          resolve(response);
        }
      },
    });
    resolveOnNext = true;
  });
}

/**
 * If there is a pending request for the given query, returns an Observable of
 * *all* its responses. Existing responses are published synchronously and
 * subsequent responses are published asynchronously. Returns null if there is
 * no pending request. This is similar to fetchQuery() except that it will not
 * issue a fetch if there isn't already one pending.
 */
function getObservableForRequestInFlight(
  environment: Environment,
  query: OperationDescriptor,
): Observable<GraphQLResponse> | null {
  const requestCache = getRequestCache(environment);
  const cacheKey = getRequestParametersIdentifier(
    query.node.params,
    query.variables,
  );
  const cachedRequest = requestCache.get(cacheKey);
  if (!cachedRequest) {
    return null;
  }

  return fetchQuery(environment, query);
}

function getRequestCache(
  environment: Environment,
): Map<RequestParametersId, RequestCacheEntry> {
  const cached: ?Map<
    RequestParametersId,
    RequestCacheEntry,
  > = requestCachesByEnvironment.get(environment);
  if (cached != null) {
    return cached;
  }
  const requestCache: Map<RequestParametersId, RequestCacheEntry> = new Map();
  requestCachesByEnvironment.set(environment, requestCache);
  return requestCache;
}

function getCachedRequest(
  requestCache: Map<RequestParametersId, RequestCacheEntry>,
  cacheKey: RequestParametersId,
) {
  const cached = requestCache.get(cacheKey);
  invariant(
    cached != null,
    '[fetchQueryInternal] getCachedRequest: Expected request to be cached',
  );
  return cached;
}

module.exports = {
  fetchQuery,
  getPromiseForRequestInFlight,
  getObservableForRequestInFlight,
  fetchQueryDeduped,
};
