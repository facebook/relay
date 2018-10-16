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

const getQueryIdentifier_UNSTABLE = require('../helpers/getQueryIdentifier_UNSTABLE');
const invariant = require('invariant');

import type {
  ExecutePayload,
  Observer,
  Subscription,
  IEnvironment,
  CacheConfig,
  Disposable,
  OperationSelector,
} from 'relay-runtime';

type ObserverEvent = {|
  event: 'start' | 'next' | 'error' | 'complete' | 'unsubscribe',
  data?: mixed,
|};

type RequestCacheEntry = {|
  subscription: Subscription,
  receivedEvents: Array<ObserverEvent>,
  observers: Array<Observer<ExecutePayload>>,
|};

type ReferencesCacheEntry = {|
  count: number,
  references: Array<Disposable>,
|};

const requestsByEnvironment: Map<
  IEnvironment,
  Map<string, RequestCacheEntry>,
> = new Map();
const referencesByEnvironment: Map<
  IEnvironment,
  Map<string, ReferencesCacheEntry>,
> = new Map();

/**
 * See docblock for `fetchQuery_UNSTABLE`
 * @private
 */
function fetchQuery(args: {|
  environment: IEnvironment,
  query: OperationSelector,
  observer?: Observer<ExecutePayload>,
  networkLayerCacheConfig?: CacheConfig,
|}): Disposable {
  const {environment, query, observer, networkLayerCacheConfig} = args;
  const {createOperationSelector} = environment.unstable_internal;
  const requestCache = getRequestCache(environment);
  const referencesCache = getReferencesCache(environment);
  const cacheKey = getQueryIdentifier_UNSTABLE(query);
  const cachedRequest = requestCache.get(cacheKey);
  const cachedReferences = referencesCache.get(cacheKey);

  if (cachedReferences) {
    referencesCache.set(cacheKey, {
      ...cachedReferences,
      count: cachedReferences.count + 1,
    });
  } else {
    referencesCache.set(cacheKey, {
      references: [],
      count: 1,
    });
  }

  if (cachedRequest) {
    // We manage observers manually due to the lack of an RxJS Subject abstraction
    // (https://fburl.com/s6m56gim)
    const observers =
      observer && !cachedRequest.observers.find(o => o === observer)
        ? [...cachedRequest.observers, observer]
        : cachedRequest.observers;

    if (observer) {
      cachedRequest.receivedEvents.forEach(observerEvent => {
        const {data} = observerEvent;
        // eslint-disable-next-line lint/flow-no-fixme
        const eventHandler: $FlowFixMe = observer[observerEvent.event];
        if (data !== undefined) {
          eventHandler && eventHandler(data);
        } else {
          eventHandler && eventHandler();
        }
      });
    }
    requestCache.set(cacheKey, {
      ...cachedRequest,
      observers,
    });
  } else {
    environment
      .execute({operation: query, cacheConfig: networkLayerCacheConfig})
      .map(payload => {
        const operationForPayload = createOperationSelector(
          query.node,
          payload.variables,
          payload.operation,
        );
        const cached = referencesCache.get(cacheKey);
        invariant(
          cached != null,
          'fetchQuery: Expected references to be cached',
        );
        cached.references.push(environment.retain(operationForPayload.root));
        return payload;
      })
      .finally(() => {
        requestCache.delete(cacheKey);
      })
      .subscribe({
        start: subscription => {
          requestCache.set(cacheKey, {
            subscription: subscription,
            observers: observer ? [observer] : [],
            receivedEvents: [],
          });
          addReceivedEvent(requestCache, cacheKey, {
            event: 'start',
            data: subscription,
          });
          getCachedObservers(requestCache, cacheKey).forEach(
            o => o.start && o.start(subscription),
          );
        },
        next: payload => {
          addReceivedEvent(requestCache, cacheKey, {
            event: 'next',
            data: payload,
          });
          getCachedObservers(requestCache, cacheKey).forEach(
            o => o.next && o.next(payload),
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
        unsubscribe: subscription => {
          addReceivedEvent(requestCache, cacheKey, {
            event: 'unsubscribe',
            data: subscription,
          });
          getCachedObservers(requestCache, cacheKey).forEach(
            o => o.unsubscribe && o.unsubscribe(subscription),
          );
        },
      });
  }

  return {
    dispose: () => {
      const cachedRefs = referencesCache.get(cacheKey);
      invariant(
        cachedRefs != null,
        'fetchQuery: Expected references to be cached',
      );
      const {count, references} = cachedRefs;
      if (count === 1) {
        references.forEach(r => r.dispose());
        referencesCache.delete(cacheKey);

        const cachedReq = requestCache.get(cacheKey);
        if (cachedReq) {
          cachedReq.subscription.unsubscribe();
        }
      } else {
        referencesCache.set(cacheKey, {
          references,
          count: Math.max(0, count - 1),
        });
      }
    },
  };
}

/**
 * If a request is in flight for the given query, variables and environment,
 * this function will return a Promise that will resolve when that request has
 * completed and the data has been saved to the store.
 * If no request is in flight, null will be returned
 * @private
 */
function getPromiseForRequestInFlight(args: {|
  environment: IEnvironment,
  query: OperationSelector,
|}): Promise<void> | null {
  const {environment, query} = args;
  const requestCache = getRequestCache(environment);
  const cacheKey = getQueryIdentifier_UNSTABLE(query);
  const cachedRequest = requestCache.get(cacheKey);
  if (cachedRequest == null) {
    return null;
  }
  return new Promise((resolve, reject) => {
    const disposable: ?Disposable = fetchQuery({
      environment,
      query,
      observer: {
        complete: () => {
          if (disposable) {
            disposable.dispose();
          }
          resolve();
        },
        error: error => {
          if (disposable) {
            disposable.dispose();
          }
          reject(error);
        },
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
  invariant(cached != null, 'fetchQuery: Expected request to be cached');
  const receivedEvents = [...cached.receivedEvents, observerEvent];
  requestCache.set(cacheKey, {
    ...cached,
    receivedEvents,
  });
}

function getRequestCache(
  environment: IEnvironment,
): Map<string, RequestCacheEntry> {
  const cached = requestsByEnvironment.get(environment);
  if (cached != null) {
    return cached;
  }
  const requestCache = new Map();
  requestsByEnvironment.set(environment, requestCache);
  return requestCache;
}

function getReferencesCache(
  environment: IEnvironment,
): Map<string, ReferencesCacheEntry> {
  const cached = referencesByEnvironment.get(environment);
  if (cached != null) {
    return cached;
  }
  const referencesCache = new Map();
  referencesByEnvironment.set(environment, referencesCache);
  return referencesCache;
}

function getCachedObservers(
  requestCache: Map<string, RequestCacheEntry>,
  cacheKey: string,
): Array<Observer<ExecutePayload>> {
  const cached = requestCache.get(cacheKey);
  invariant(cached != null, 'fetchQuery: Expected request to be cached');
  return cached.observers;
}

module.exports = {
  fetchQuery,
  getPromiseForRequestInFlight,
};
