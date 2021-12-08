/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {Cache} from './LRUCache';
import type {
  Disposable,
  FetchPolicy,
  GraphQLResponse,
  IEnvironment,
  Observable,
  Observer,
  OperationAvailability,
  OperationDescriptor,
  ReaderFragment,
  RenderPolicy,
  Snapshot,
  Subscription,
} from 'relay-runtime';

const LRUCache = require('./LRUCache');
const SuspenseResource = require('./SuspenseResource');
const invariant = require('invariant');
const {RelayFeatureFlags, isPromise} = require('relay-runtime');
const warning = require('warning');

const CACHE_CAPACITY = 1000;
const DEFAULT_FETCH_POLICY = 'store-or-network';

export type QueryResource = QueryResourceImpl;

type QueryResourceCache = Cache<QueryResourceCacheEntry>;
type QueryResourceCacheEntry = {|
  +id: number,
  +cacheIdentifier: string,
  +operationAvailability: ?OperationAvailability,
  // The number of received payloads for the operation.
  // We want to differentiate the initial graphql response for the operation
  // from the incremental responses, so later we can choose how to handle errors
  // in the incremental payloads.
  processedPayloadsCount: number,
  getRetainCount(): number,
  getNetworkSubscription(): ?Subscription,
  setNetworkSubscription(?Subscription): void,
  getValue(): Error | Promise<void> | QueryResult,
  setValue(Error | Promise<void> | QueryResult): void,
  temporaryRetain(environment: IEnvironment): Disposable,
  permanentRetain(environment: IEnvironment): Disposable,
  releaseTemporaryRetain(): void,
|};
export opaque type QueryResult: {
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
  ...
} = {|
  cacheIdentifier: string,
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
  operation: OperationDescriptor,
|};

const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';
interface IMap<K, V> {
  get(key: K): V | void;
  set(key: K, value: V): IMap<K, V>;
}

function operationIsLiveQuery(operation: OperationDescriptor): boolean {
  return operation.request.node.params.metadata.live !== undefined;
}

function getQueryCacheIdentifier(
  environment: IEnvironment,
  operation: OperationDescriptor,
  maybeFetchPolicy: ?FetchPolicy,
  maybeRenderPolicy: ?RenderPolicy,
  cacheBreaker?: ?string | ?number,
): string {
  const fetchPolicy = maybeFetchPolicy ?? DEFAULT_FETCH_POLICY;
  const renderPolicy =
    maybeRenderPolicy ?? environment.UNSTABLE_getDefaultRenderPolicy();
  const cacheIdentifier = `${fetchPolicy}-${renderPolicy}-${operation.request.identifier}`;
  if (cacheBreaker != null) {
    return `${cacheIdentifier}-${cacheBreaker}`;
  }
  return cacheIdentifier;
}

function getQueryResult(
  operation: OperationDescriptor,
  cacheIdentifier: string,
): QueryResult {
  const rootFragmentRef = {
    __id: operation.fragment.dataID,
    __fragments: {
      [operation.fragment.node.name]: operation.request.variables,
    },
    __fragmentOwner: operation.request,
  };
  return {
    cacheIdentifier,
    fragmentNode: operation.request.node.fragment,
    fragmentRef: rootFragmentRef,
    operation,
  };
}

let nextID = 200000;

function createCacheEntry(
  cacheIdentifier: string,
  operation: OperationDescriptor,
  operationAvailability: ?OperationAvailability,
  value: Error | Promise<void> | QueryResult,
  networkSubscription: ?Subscription,
  onDispose: QueryResourceCacheEntry => void,
): QueryResourceCacheEntry {
  // There should be no behavior difference between createCacheEntry_new and
  // createCacheEntry_old, and it doesn't directly relate to Client Edges.
  // It was just a refactoring that was needed for Client Edges but that
  // is behind the feature flag just in case there is any accidental breakage.
  if (RelayFeatureFlags.REFACTOR_SUSPENSE_RESOURCE) {
    return createCacheEntry_new(
      cacheIdentifier,
      operation,
      operationAvailability,
      value,
      networkSubscription,
      onDispose,
    );
  } else {
    return createCacheEntry_old(
      cacheIdentifier,
      operation,
      operationAvailability,
      value,
      networkSubscription,
      onDispose,
    );
  }
}

function createCacheEntry_new(
  cacheIdentifier: string,
  operation: OperationDescriptor,
  operationAvailability: ?OperationAvailability,
  value: Error | Promise<void> | QueryResult,
  networkSubscription: ?Subscription,
  onDispose: QueryResourceCacheEntry => void,
): QueryResourceCacheEntry {
  const isLiveQuery = operationIsLiveQuery(operation);

  let currentValue: Error | Promise<void> | QueryResult = value;
  let currentNetworkSubscription: ?Subscription = networkSubscription;

  const suspenseResource = new SuspenseResource(environment => {
    const retention = environment.retain(operation);
    return {
      dispose: () => {
        // Normally if this entry never commits, the request would've ended by the
        // time this timeout expires and the temporary retain is released. However,
        // we need to do this for live queries which remain open indefinitely.
        if (isLiveQuery && currentNetworkSubscription != null) {
          currentNetworkSubscription.unsubscribe();
        }
        retention.dispose();
        onDispose(cacheEntry);
      },
    };
  });

  const cacheEntry = {
    cacheIdentifier,
    id: nextID++,
    processedPayloadsCount: 0,
    operationAvailability,
    getValue() {
      return currentValue;
    },
    setValue(val: QueryResult | Promise<void> | Error) {
      currentValue = val;
    },
    getRetainCount() {
      return suspenseResource.getRetainCount();
    },
    getNetworkSubscription() {
      return currentNetworkSubscription;
    },
    setNetworkSubscription(subscription: ?Subscription) {
      if (isLiveQuery && currentNetworkSubscription != null) {
        currentNetworkSubscription.unsubscribe();
      }
      currentNetworkSubscription = subscription;
    },
    temporaryRetain(environment: IEnvironment): Disposable {
      return suspenseResource.temporaryRetain(environment);
    },
    permanentRetain(environment: IEnvironment): Disposable {
      return suspenseResource.permanentRetain(environment);
    },
    releaseTemporaryRetain() {
      suspenseResource.releaseTemporaryRetain();
    },
  };

  return cacheEntry;
}

const DATA_RETENTION_TIMEOUT = 5 * 60 * 1000;
function createCacheEntry_old(
  cacheIdentifier: string,
  operation: OperationDescriptor,
  operationAvailability: ?OperationAvailability,
  value: Error | Promise<void> | QueryResult,
  networkSubscription: ?Subscription,
  onDispose: QueryResourceCacheEntry => void,
): QueryResourceCacheEntry {
  const isLiveQuery = operationIsLiveQuery(operation);

  let currentValue: Error | Promise<void> | QueryResult = value;
  let retainCount = 0;
  let retainDisposable: ?Disposable = null;
  let releaseTemporaryRetain: ?() => void = null;
  let currentNetworkSubscription: ?Subscription = networkSubscription;

  const retain = (environment: IEnvironment) => {
    retainCount++;
    if (retainCount === 1) {
      retainDisposable = environment.retain(operation);
    }
    return {
      dispose: () => {
        retainCount = Math.max(0, retainCount - 1);
        if (retainCount === 0) {
          invariant(
            retainDisposable != null,
            'Relay: Expected disposable to release query to be defined.' +
              "If you're seeing this, this is likely a bug in Relay.",
          );
          retainDisposable.dispose();
          retainDisposable = null;
        }
        onDispose(cacheEntry);
      },
    };
  };

  const cacheEntry = {
    cacheIdentifier,
    id: nextID++,
    processedPayloadsCount: 0,
    operationAvailability,
    getValue() {
      return currentValue;
    },
    setValue(val: QueryResult | Promise<void> | Error) {
      currentValue = val;
    },
    getRetainCount() {
      return retainCount;
    },
    getNetworkSubscription() {
      return currentNetworkSubscription;
    },
    setNetworkSubscription(subscription: ?Subscription) {
      if (isLiveQuery && currentNetworkSubscription != null) {
        currentNetworkSubscription.unsubscribe();
      }
      currentNetworkSubscription = subscription;
    },
    temporaryRetain(environment: IEnvironment): Disposable {
      // NOTE: If we're executing in a server environment, there's no need
      // to create temporary retains, since the component will never commit.
      if (environment.isServer()) {
        return {dispose: () => {}};
      }

      // NOTE: temporaryRetain is called during the render phase. However,
      // given that we can't tell if this render will eventually commit or not,
      // we create a timer to autodispose of this retain in case the associated
      // component never commits.
      // If the component /does/ commit, permanentRetain will clear this timeout
      // and permanently retain the data.
      const disposable = retain(environment);
      let releaseQueryTimeout = null;
      const localReleaseTemporaryRetain = () => {
        clearTimeout(releaseQueryTimeout);
        releaseQueryTimeout = null;
        releaseTemporaryRetain = null;
        disposable.dispose();
        // Normally if this entry never commits, the request would've ended by the
        // time this timeout expires and the temporary retain is released. However,
        // we need to do this for live queries which remain open indefinitely.
        if (
          isLiveQuery &&
          retainCount <= 0 &&
          currentNetworkSubscription != null
        ) {
          currentNetworkSubscription.unsubscribe();
        }
      };
      releaseQueryTimeout = setTimeout(
        localReleaseTemporaryRetain,
        DATA_RETENTION_TIMEOUT,
      );

      // NOTE: Since temporaryRetain can be called multiple times, we release
      // the previous temporary retain after we re-establish a new one, since
      // we only ever need a single temporary retain until the permanent retain is
      // established.
      // temporaryRetain may be called multiple times by React during the render
      // phase, as well as multiple times by other query components that are
      // rendering the same query/variables.
      if (releaseTemporaryRetain != null) {
        releaseTemporaryRetain();
      }
      releaseTemporaryRetain = localReleaseTemporaryRetain;

      return {
        dispose: () => {
          releaseTemporaryRetain && releaseTemporaryRetain();
        },
      };
    },
    permanentRetain(environment: IEnvironment): Disposable {
      const disposable = retain(environment);
      if (releaseTemporaryRetain != null) {
        releaseTemporaryRetain();
        releaseTemporaryRetain = null;
      }

      return {
        dispose: () => {
          disposable.dispose();
          if (
            isLiveQuery &&
            retainCount <= 0 &&
            currentNetworkSubscription != null
          ) {
            currentNetworkSubscription.unsubscribe();
          }
        },
      };
    },
    releaseTemporaryRetain() {
      if (releaseTemporaryRetain != null) {
        releaseTemporaryRetain();
        releaseTemporaryRetain = null;
      }
    },
  };

  return cacheEntry;
}

class QueryResourceImpl {
  _environment: IEnvironment;
  _cache: QueryResourceCache;

  constructor(environment: IEnvironment) {
    this._environment = environment;
    this._cache = LRUCache.create(CACHE_CAPACITY);
  }

  prepare(
    operation: OperationDescriptor,
    fetchObservable: Observable<GraphQLResponse>,
    maybeFetchPolicy: ?FetchPolicy,
    maybeRenderPolicy: ?RenderPolicy,
    observer: ?Observer<Snapshot>,
    cacheBreaker: ?string | ?number,
    profilerContext: mixed,
  ): QueryResult {
    const cacheIdentifier = getQueryCacheIdentifier(
      this._environment,
      operation,
      maybeFetchPolicy,
      maybeRenderPolicy,
      cacheBreaker,
    );
    return this.prepareWithIdentifier(
      cacheIdentifier,
      operation,
      fetchObservable,
      maybeFetchPolicy,
      maybeRenderPolicy,
      observer,
      profilerContext,
    );
  }

  /**
   * This function should be called during a Component's render function,
   * to either read an existing cached value for the query, or fetch the query
   * and suspend.
   */
  prepareWithIdentifier(
    cacheIdentifier: string,
    operation: OperationDescriptor,
    fetchObservable: Observable<GraphQLResponse>,
    maybeFetchPolicy: ?FetchPolicy,
    maybeRenderPolicy: ?RenderPolicy,
    observer: ?Observer<Snapshot>,
    profilerContext: mixed,
  ): QueryResult {
    const environment = this._environment;
    const fetchPolicy = maybeFetchPolicy ?? DEFAULT_FETCH_POLICY;
    const renderPolicy =
      maybeRenderPolicy ?? environment.UNSTABLE_getDefaultRenderPolicy();

    // 1. Check if there's a cached value for this operation, and reuse it if
    // it's available
    let cacheEntry = this._cache.get(cacheIdentifier);
    let temporaryRetainDisposable: ?Disposable = null;
    const entryWasCached = cacheEntry != null;
    if (cacheEntry == null) {
      // 2. If a cached value isn't available, try fetching the operation.
      // _fetchAndSaveQuery will update the cache with either a Promise or
      // an Error to throw, or a QueryResult to return.
      cacheEntry = this._fetchAndSaveQuery(
        cacheIdentifier,
        operation,
        fetchObservable,
        fetchPolicy,
        renderPolicy,
        profilerContext,
        {
          ...observer,
          unsubscribe(subscription) {
            // 4. If the request is cancelled, make sure to dispose
            // of the temporary retain; this will ensure that a promise
            // doesn't remain unnecessarily cached until the temporary retain
            // expires. Not clearing the temporary retain might cause the
            // query to incorrectly re-suspend.
            if (temporaryRetainDisposable != null) {
              temporaryRetainDisposable.dispose();
            }
            const observerUnsubscribe = observer?.unsubscribe;
            observerUnsubscribe && observerUnsubscribe(subscription);
          },
        },
      );
    }

    // 3. Temporarily retain here in render phase. When the component reading
    // the operation is committed, we will transfer ownership of data retention
    // to the component.
    // In case the component never commits (mounts or updates) from this render,
    // this data retention hold will auto-release itself after a timeout.
    temporaryRetainDisposable = cacheEntry.temporaryRetain(environment);

    const cachedValue = cacheEntry.getValue();
    if (isPromise(cachedValue)) {
      environment.__log({
        name: 'suspense.query',
        fetchPolicy,
        isPromiseCached: entryWasCached,
        operation: operation,
        queryAvailability: cacheEntry.operationAvailability,
        renderPolicy,
      });
      throw cachedValue;
    }
    if (cachedValue instanceof Error) {
      throw cachedValue;
    }
    return cachedValue;
  }

  /**
   * This function should be called during a component's commit phase
   * (e.g. inside useEffect), in order to retain the operation in the Relay store
   * and transfer ownership of the operation to the component lifecycle.
   */
  retain(queryResult: QueryResult, profilerContext: mixed): Disposable {
    const environment = this._environment;
    const {cacheIdentifier, operation} = queryResult;
    const cacheEntry = this._getOrCreateCacheEntry(
      cacheIdentifier,
      operation,
      null,
      queryResult,
      null,
    );
    const disposable = cacheEntry.permanentRetain(environment);
    environment.__log({
      name: 'queryresource.retain',
      profilerContext,
      resourceID: cacheEntry.id,
    });

    return {
      dispose: () => {
        disposable.dispose();
      },
    };
  }

  releaseTemporaryRetain(queryResult: QueryResult) {
    const cacheEntry = this._cache.get(queryResult.cacheIdentifier);
    if (cacheEntry != null) {
      cacheEntry.releaseTemporaryRetain();
    }
  }

  TESTS_ONLY__getCacheEntry(
    operation: OperationDescriptor,
    maybeFetchPolicy?: ?FetchPolicy,
    maybeRenderPolicy?: ?RenderPolicy,
    cacheBreaker?: ?string,
  ): ?QueryResourceCacheEntry {
    const environment = this._environment;
    const cacheIdentifier = getQueryCacheIdentifier(
      environment,
      operation,
      maybeFetchPolicy,
      maybeRenderPolicy,
      cacheBreaker,
    );
    return this._cache.get(cacheIdentifier);
  }

  _clearCacheEntry = (cacheEntry: QueryResourceCacheEntry): void => {
    // The new code does this retainCount <= 0 check within SuspenseResource
    // before calling _clearCacheEntry, whereas with the old code we do it here.
    if (RelayFeatureFlags.REFACTOR_SUSPENSE_RESOURCE) {
      this._cache.delete(cacheEntry.cacheIdentifier);
    } else {
      if (cacheEntry.getRetainCount() <= 0) {
        this._cache.delete(cacheEntry.cacheIdentifier);
      }
    }
  };

  _getOrCreateCacheEntry(
    cacheIdentifier: string,
    operation: OperationDescriptor,
    operationAvailability: ?OperationAvailability,
    value: Error | Promise<void> | QueryResult,
    networkSubscription: ?Subscription,
  ): QueryResourceCacheEntry {
    let cacheEntry = this._cache.get(cacheIdentifier);
    if (cacheEntry == null) {
      cacheEntry = createCacheEntry(
        cacheIdentifier,
        operation,
        operationAvailability,
        value,
        networkSubscription,
        this._clearCacheEntry,
      );
      this._cache.set(cacheIdentifier, cacheEntry);
    }
    return cacheEntry;
  }

  _fetchAndSaveQuery(
    cacheIdentifier: string,
    operation: OperationDescriptor,
    fetchObservable: Observable<GraphQLResponse>,
    fetchPolicy: FetchPolicy,
    renderPolicy: RenderPolicy,
    profilerContext: mixed,
    observer: Observer<Snapshot>,
  ): QueryResourceCacheEntry {
    const environment = this._environment;

    // NOTE: Running `check` will write missing data to the store using any
    // missing data handlers specified on the environment;
    // We run it here first to make the handlers get a chance to populate
    // missing data.
    const queryAvailability = environment.check(operation);
    const queryStatus = queryAvailability.status;
    const hasFullQuery = queryStatus === 'available';
    const canPartialRender =
      hasFullQuery || (renderPolicy === 'partial' && queryStatus !== 'stale');

    let shouldFetch;
    let shouldAllowRender;
    let resolveNetworkPromise = () => {};
    switch (fetchPolicy) {
      case 'store-only': {
        shouldFetch = false;
        shouldAllowRender = true;
        break;
      }
      case 'store-or-network': {
        shouldFetch = !hasFullQuery;
        shouldAllowRender = canPartialRender;
        break;
      }
      case 'store-and-network': {
        shouldFetch = true;
        shouldAllowRender = canPartialRender;
        break;
      }
      case 'network-only':
      default: {
        shouldFetch = true;
        shouldAllowRender = false;
        break;
      }
    }

    // NOTE: If this value is false, we will cache a promise for this
    // query, which means we will suspend here at this query root.
    // If it's true, we will cache the query resource and allow rendering to
    // continue.
    if (shouldAllowRender) {
      const queryResult = getQueryResult(operation, cacheIdentifier);
      const cacheEntry = createCacheEntry(
        cacheIdentifier,
        operation,
        queryAvailability,
        queryResult,
        null,
        this._clearCacheEntry,
      );
      this._cache.set(cacheIdentifier, cacheEntry);
    }

    if (shouldFetch) {
      const queryResult = getQueryResult(operation, cacheIdentifier);
      let networkSubscription;
      fetchObservable.subscribe({
        start: subscription => {
          networkSubscription = subscription;
          const cacheEntry = this._cache.get(cacheIdentifier);
          if (cacheEntry) {
            cacheEntry.setNetworkSubscription(networkSubscription);
          }
          const observerStart = observer?.start;
          if (observerStart) {
            const subscriptionWithConditionalCancelation = {
              ...subscription,
              unsubscribe: () => {
                // Only live queries should have their network requests canceled.
                if (operationIsLiveQuery(operation)) {
                  subscription.unsubscribe();
                }
              },
            };
            observerStart(subscriptionWithConditionalCancelation);
          }
        },
        next: () => {
          const cacheEntry = this._getOrCreateCacheEntry(
            cacheIdentifier,
            operation,
            queryAvailability,
            queryResult,
            networkSubscription,
          );
          cacheEntry.processedPayloadsCount += 1;
          cacheEntry.setValue(queryResult);
          resolveNetworkPromise();

          const observerNext = observer?.next;
          if (observerNext != null) {
            const snapshot = environment.lookup(operation.fragment);
            observerNext(snapshot);
          }
        },
        error: error => {
          const cacheEntry = this._getOrCreateCacheEntry(
            cacheIdentifier,
            operation,
            queryAvailability,
            error,
            networkSubscription,
          );

          // If, this is the first thing we receive for the query,
          // before any other payload handled is error, we will cache and
          // re-throw that error later.

          // We will ignore errors for any incremental payloads we receive.
          if (cacheEntry.processedPayloadsCount === 0) {
            cacheEntry.setValue(error);
          } else {
            // TODO:T92030819 Remove this warning and actually throw the network error
            // To complete this task we need to have a way of precisely tracking suspendable points
            warning(
              false,
              'QueryResource: An incremental payload for query `%` returned an error: `%`:`%`.',
              operation.fragment.node.name,
              error.message,
              error.stack,
            );
          }
          resolveNetworkPromise();

          networkSubscription = null;
          cacheEntry.setNetworkSubscription(null);
          const observerError = observer?.error;
          observerError && observerError(error);
        },
        complete: () => {
          resolveNetworkPromise();

          networkSubscription = null;
          const cacheEntry = this._cache.get(cacheIdentifier);
          if (cacheEntry) {
            cacheEntry.setNetworkSubscription(null);
          }
          const observerComplete = observer?.complete;
          observerComplete && observerComplete();
        },
        unsubscribe: observer?.unsubscribe,
      });

      let cacheEntry = this._cache.get(cacheIdentifier);
      if (!cacheEntry) {
        const networkPromise = new Promise(resolve => {
          resolveNetworkPromise = resolve;
        });

        // $FlowExpectedError[prop-missing] Expando to annotate Promises.
        networkPromise.displayName =
          'Relay(' + operation.fragment.node.name + ')';

        cacheEntry = createCacheEntry(
          cacheIdentifier,
          operation,
          queryAvailability,
          networkPromise,
          networkSubscription,
          this._clearCacheEntry,
        );
        this._cache.set(cacheIdentifier, cacheEntry);
      }
    } else {
      const observerComplete = observer?.complete;
      observerComplete && observerComplete();
    }
    const cacheEntry = this._cache.get(cacheIdentifier);
    invariant(
      cacheEntry != null,
      'Relay: Expected to have cached a result when attempting to fetch query.' +
        "If you're seeing this, this is likely a bug in Relay.",
    );
    environment.__log({
      name: 'queryresource.fetch',
      resourceID: cacheEntry.id,
      operation,
      profilerContext,
      fetchPolicy,
      renderPolicy,
      queryAvailability,
      shouldFetch,
    });
    return cacheEntry;
  }
}

function createQueryResource(environment: IEnvironment): QueryResource {
  return new QueryResourceImpl(environment);
}

const dataResources: IMap<IEnvironment, QueryResource> = WEAKMAP_SUPPORTED
  ? new WeakMap()
  : new Map();

function getQueryResourceForEnvironment(
  environment: IEnvironment,
): QueryResourceImpl {
  const cached = dataResources.get(environment);
  if (cached) {
    return cached;
  }
  const newDataResource = createQueryResource(environment);
  dataResources.set(environment, newDataResource);
  return newDataResource;
}

module.exports = {
  createQueryResource,
  getQueryResourceForEnvironment,
  getQueryCacheIdentifier,
};
