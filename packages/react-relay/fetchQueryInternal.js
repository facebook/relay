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

const getOperationIdentifier = require('./getOperationIdentifier');
const invariant = require('invariant');

const {Observable} = require('relay-runtime');

import type {
  CacheConfig,
  IEnvironment,
  OperationDescriptor,
  Snapshot,
  Subscription,
} from 'relay-runtime';

type ObserverEvent = {|
  event: 'next' | 'error' | 'complete',
  data?: mixed,
|};

type Sink<-T> = {|
  +next: T => void,
  +error: (Error, isUncaughtThrownError?: boolean) => void,
  +complete: () => void,
  +closed: boolean,
|};

type RequestCacheEntry = {|
  +count: number,
  +subscription: Subscription,
  +receivedEvents: Array<ObserverEvent>,
  +observers: Array<Sink<Snapshot>>,
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
  environment: IEnvironment,
  query: OperationDescriptor,
  options?: {|
    networkCacheConfig?: CacheConfig,
  |},
): Observable<Snapshot> {
  return Observable.create(sink => {
    const networkCacheConfig = options?.networkCacheConfig;
    const requestCache = getRequestCache(environment);
    const cacheKey = getOperationIdentifier(query);
    const cachedRequest = requestCache.get(cacheKey);

    if (cachedRequest) {
      // We manage observers manually due to the lack of an RxJS Subject abstraction
      // (https://fburl.com/s6m56gim)
      const observers =
        sink && !cachedRequest.observers.find(o => o === sink)
          ? [...cachedRequest.observers, sink]
          : cachedRequest.observers;

      cachedRequest.receivedEvents.forEach(observerEvent => {
        const {data} = observerEvent;
        const eventHandler: $FlowFixMe = sink[observerEvent.event];
        if (data !== undefined) {
          eventHandler && eventHandler(data);
        } else {
          eventHandler && eventHandler();
        }
      });
      requestCache.set(cacheKey, {
        ...cachedRequest,
        count: cachedRequest.count + 1,
        observers,
      });
    } else {
      environment
        .execute({operation: query, cacheConfig: networkCacheConfig})
        .map(payload => {
          return payload;
        })
        .finally(() => {
          requestCache.delete(cacheKey);
        })
        .subscribe({
          start: subscription => {
            requestCache.set(cacheKey, {
              count: 1,
              subscription: subscription,
              observers: sink ? [sink] : [],
              receivedEvents: [],
            });
          },
          next: () => {
            const snapshot = environment.lookup(query.fragment, query);
            addReceivedEvent(requestCache, cacheKey, {
              event: 'next',
              data: snapshot,
            });
            getCachedObservers(requestCache, cacheKey).forEach(
              o => o.next && o.next(snapshot),
            );
          },
          error: error => {
            addReceivedEvent(requestCache, cacheKey, {
              event: 'error',
              data: error,
            });
            getCachedObservers(requestCache, cacheKey).forEach(
              o => o.error && o.error(error),
            );
          },
          complete: () => {
            addReceivedEvent(requestCache, cacheKey, {
              event: 'complete',
            });
            getCachedObservers(requestCache, cacheKey).forEach(
              o => o.complete && o.complete(),
            );
          },
          unsubscribe: subscription => {},
        });
    }

    return () => {
      const cachedRequestInstance = requestCache.get(cacheKey);
      if (cachedRequestInstance) {
        if (cachedRequestInstance.count === 1) {
          cachedRequestInstance.subscription.unsubscribe();
          requestCache.delete(cacheKey);
        } else {
          requestCache.set(cacheKey, {
            ...cachedRequestInstance,
            count: cachedRequestInstance.count - 1,
          });
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
  environment: IEnvironment,
  query: OperationDescriptor,
): Promise<?Snapshot> | null {
  const requestCache = getRequestCache(environment);
  const cacheKey = getOperationIdentifier(query);
  const cachedRequest = requestCache.get(cacheKey);
  if (!cachedRequest) {
    return null;
  }

  const {receivedEvents} = cachedRequest;
  let receivedNextCount = receivedEvents.filter(e => e.event === 'next').length;
  return new Promise((resolve, reject) => {
    fetchQuery(environment, query).subscribe({
      complete: resolve,
      error: reject,
      next: () => {
        // NOTE: Only resolve the promise upon the next call to `next`.
        // Otherwise, resolving for calls to `next` that have already occurred
        // will cause the promise to resolve immediately
        if (receivedNextCount-- <= 0) {
          resolve();
        }
      },
    });
  });
}

function addReceivedEvent(
  requestCache: Map<string, RequestCacheEntry>,
  cacheKey: string,
  observerEvent: ObserverEvent,
) {
  const cached = requestCache.get(cacheKey);
  invariant(
    cached != null,
    '[fetchQueryInternal] addReceivedEvent: Expected request to be cached',
  );
  const receivedEvents = [...cached.receivedEvents, observerEvent];
  requestCache.set(cacheKey, {
    ...cached,
    receivedEvents,
  });
}

function getRequestCache(
  environment: IEnvironment,
): Map<string, RequestCacheEntry> {
  const cached: ?Map<
    string,
    RequestCacheEntry,
  > = requestCachesByEnvironment.get(environment);
  if (cached != null) {
    return cached;
  }
  const requestCache: Map<string, RequestCacheEntry> = new Map();
  requestCachesByEnvironment.set(environment, requestCache);
  return requestCache;
}

function getCachedObservers(
  requestCache: Map<string, RequestCacheEntry>,
  cacheKey: string,
): Array<Sink<Snapshot>> {
  const cached = requestCache.get(cacheKey);
  invariant(
    cached != null,
    '[fetchQueryInternal] getCachedObservers: Expected request to be cached',
  );
  return cached.observers;
}

module.exports = {
  fetchQuery,
  getPromiseForRequestInFlight,
};
