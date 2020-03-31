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

const ExecutionEnvironment = require('./ExecutionEnvironment');
const LRUCache = require('./LRUCache');

const invariant = require('invariant');

const {isPromise} = require('relay-runtime');

const CACHE_CAPACITY = 1000;

const DEFAULT_FETCH_POLICY = 'store-or-network';

const DATA_RETENTION_TIMEOUT = 30 * 1000;

import type {
  Disposable,
  FetchPolicy,
  FragmentPointer,
  GraphQLResponse,
  IEnvironment,
  Observable,
  Observer,
  OperationDescriptor,
  ReaderFragment,
  RenderPolicy,
  Snapshot,
  Subscription,
} from 'relay-runtime';
import type {Cache} from './LRUCache';

export type QueryResource = QueryResourceImpl;

type QueryResourceCache = Cache<QueryResourceCacheEntry>;
type QueryResourceCacheEntry = {|
  +id: number,
  +cacheKey: string,
  getRetainCount(): number,
  getNetworkSubscription(): ?Subscription,
  setNetworkSubscription(?Subscription): void,
  getValue(): Error | Promise<void> | QueryResult,
  setValue(Error | Promise<void> | QueryResult): void,
  temporaryRetain(environment: IEnvironment): Disposable,
  permanentRetain(environment: IEnvironment): Disposable,
|};
opaque type QueryResult: {
  fragmentNode: ReaderFragment,
  fragmentRef: FragmentPointer,
  ...
} = {|
  cacheKey: string,
  fragmentNode: ReaderFragment,
  fragmentRef: FragmentPointer,
  operation: OperationDescriptor,
|};

const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';
interface IMap<K, V> {
  get(key: K): V | void;
  set(key: K, value: V): IMap<K, V>;
}

function getQueryCacheKey(
  operation: OperationDescriptor,
  fetchPolicy: FetchPolicy,
  renderPolicy: RenderPolicy,
): string {
  return `${fetchPolicy}-${renderPolicy}-${operation.request.identifier}`;
}

function getQueryResult(
  operation: OperationDescriptor,
  cacheKey: string,
): QueryResult {
  const rootFragmentRef = {
    __id: operation.fragment.dataID,
    __fragments: {
      [operation.fragment.node.name]: operation.request.variables,
    },
    __fragmentOwner: operation.request,
  };
  return {
    cacheKey,
    fragmentNode: operation.request.node.fragment,
    fragmentRef: rootFragmentRef,
    operation,
  };
}

let nextID = 200000;

function createCacheEntry(
  cacheKey: string,
  operation: OperationDescriptor,
  value: Error | Promise<void> | QueryResult,
  networkSubscription: ?Subscription,
  onDispose: QueryResourceCacheEntry => void,
): QueryResourceCacheEntry {
  let currentValue: Error | Promise<void> | QueryResult = value;
  let retainCount = 0;
  let permanentlyRetained = false;
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
    cacheKey,
    id: nextID++,
    getValue() {
      return currentValue;
    },
    setValue(val) {
      currentValue = val;
    },
    getRetainCount() {
      return retainCount;
    },
    getNetworkSubscription() {
      return currentNetworkSubscription;
    },
    setNetworkSubscription(subscription: ?Subscription) {
      if (currentNetworkSubscription != null) {
        currentNetworkSubscription.unsubscribe();
      }
      currentNetworkSubscription = subscription;
    },
    temporaryRetain(environment: IEnvironment): Disposable {
      // NOTE: If we're executing in a server environment, there's no need
      // to create temporary retains, since the component will never commit.
      if (ExecutionEnvironment.isServer) {
        return {dispose: () => {}};
      }

      if (permanentlyRetained === true) {
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
      // phase, as well multiple times by other query components that are
      // rendering the same query/variables.
      if (releaseTemporaryRetain != null) {
        releaseTemporaryRetain();
      }
      releaseTemporaryRetain = localReleaseTemporaryRetain;

      return {
        dispose: () => {
          if (permanentlyRetained === true) {
            return;
          }
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

      permanentlyRetained = true;
      return {
        dispose: () => {
          disposable.dispose();
          if (retainCount <= 0 && currentNetworkSubscription != null) {
            currentNetworkSubscription.unsubscribe();
          }
          permanentlyRetained = false;
        },
      };
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

  /**
   * This function should be called during a Component's render function,
   * to either read an existing cached value for the query, or fetch the query
   * and suspend.
   */
  prepare(
    operation: OperationDescriptor,
    fetchObservable: Observable<GraphQLResponse>,
    maybeFetchPolicy: ?FetchPolicy,
    maybeRenderPolicy: ?RenderPolicy,
    observer: ?Observer<Snapshot>,
    cacheKeyBuster: ?string | ?number,
    profilerContext: mixed,
  ): QueryResult {
    const environment = this._environment;
    const fetchPolicy = maybeFetchPolicy ?? DEFAULT_FETCH_POLICY;
    const renderPolicy =
      maybeRenderPolicy ?? environment.UNSTABLE_getDefaultRenderPolicy();
    let cacheKey = getQueryCacheKey(operation, fetchPolicy, renderPolicy);
    if (cacheKeyBuster != null) {
      cacheKey += `-${cacheKeyBuster}`;
    }

    // 1. Check if there's a cached value for this operation, and reuse it if
    // it's available
    let cacheEntry = this._cache.get(cacheKey);
    let temporaryRetainDisposable: ?Disposable = null;
    if (cacheEntry == null) {
      // 2. If a cached value isn't available, try fetching the operation.
      // fetchAndSaveQuery will update the cache with either a Promise or
      // an Error to throw, or a FragmentResource to return.
      cacheEntry = this._fetchAndSaveQuery(
        cacheKey,
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
            // doesn't remain unnecessarilly cached until the temporary retain
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

    // 3. Temporarily retain here in render phase. When the Component reading
    // the operation is committed, we will transfer ownership of data retention
    // to the component.
    // In case the component never commits (mounts or updates) from this render,
    // this data retention hold will auto-release itself afer a timeout.
    temporaryRetainDisposable = cacheEntry.temporaryRetain(environment);

    const cachedValue = cacheEntry.getValue();
    if (isPromise(cachedValue) || cachedValue instanceof Error) {
      throw cachedValue;
    }
    return cachedValue;
  }

  /**
   * This function should be called during a Component's commit phase
   * (e.g. inside useEffect), in order to retain the operation in the Relay store
   * and transfer ownership of the operation to the component lifecycle.
   */
  retain(queryResult: QueryResult, profilerContext: mixed): Disposable {
    const environment = this._environment;
    const {cacheKey, operation} = queryResult;
    const cacheEntry = this._getOrCreateCacheEntry(
      cacheKey,
      operation,
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

  getCacheEntry(
    operation: OperationDescriptor,
    fetchPolicy: FetchPolicy,
    maybeRenderPolicy?: RenderPolicy,
  ): ?QueryResourceCacheEntry {
    const environment = this._environment;
    const renderPolicy =
      maybeRenderPolicy ?? environment.UNSTABLE_getDefaultRenderPolicy();
    const cacheKey = getQueryCacheKey(operation, fetchPolicy, renderPolicy);
    return this._cache.get(cacheKey);
  }

  _clearCacheEntry = (cacheEntry: QueryResourceCacheEntry): void => {
    if (cacheEntry.getRetainCount() <= 0) {
      this._cache.delete(cacheEntry.cacheKey);
    }
  };

  _getOrCreateCacheEntry(
    cacheKey: string,
    operation: OperationDescriptor,
    value: Error | Promise<void> | QueryResult,
    networkSubscription: ?Subscription,
  ): QueryResourceCacheEntry {
    let cacheEntry = this._cache.get(cacheKey);
    if (cacheEntry == null) {
      cacheEntry = createCacheEntry(
        cacheKey,
        operation,
        value,
        networkSubscription,
        this._clearCacheEntry,
      );
      this._cache.set(cacheKey, cacheEntry);
    }
    return cacheEntry;
  }

  _fetchAndSaveQuery(
    cacheKey: string,
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
      const queryResult = getQueryResult(operation, cacheKey);
      const cacheEntry = createCacheEntry(
        cacheKey,
        operation,
        queryResult,
        null,
        this._clearCacheEntry,
      );
      this._cache.set(cacheKey, cacheEntry);
    }

    if (shouldFetch) {
      const queryResult = getQueryResult(operation, cacheKey);
      let networkSubscription;
      fetchObservable.subscribe({
        start: subscription => {
          networkSubscription = subscription;
          const cacheEntry = this._cache.get(cacheKey);
          if (cacheEntry) {
            cacheEntry.setNetworkSubscription(networkSubscription);
          }

          const observerStart = observer?.start;
          observerStart && observerStart(subscription);
        },
        next: () => {
          const snapshot = environment.lookup(operation.fragment);
          const cacheEntry = this._getOrCreateCacheEntry(
            cacheKey,
            operation,
            queryResult,
            networkSubscription,
          );
          cacheEntry.setValue(queryResult);
          resolveNetworkPromise();

          const observerNext = observer?.next;
          observerNext && observerNext(snapshot);
        },
        error: error => {
          const cacheEntry = this._getOrCreateCacheEntry(
            cacheKey,
            operation,
            error,
            networkSubscription,
          );
          cacheEntry.setValue(error);
          resolveNetworkPromise();

          networkSubscription = null;
          cacheEntry.setNetworkSubscription(null);
          const observerError = observer?.error;
          observerError && observerError(error);
        },
        complete: () => {
          resolveNetworkPromise();

          networkSubscription = null;
          const cacheEntry = this._cache.get(cacheKey);
          if (cacheEntry) {
            cacheEntry.setNetworkSubscription(null);
          }
          const observerComplete = observer?.complete;
          observerComplete && observerComplete();
        },
        unsubscribe: observer?.unsubscribe,
      });

      let cacheEntry = this._cache.get(cacheKey);
      if (!cacheEntry) {
        const networkPromise = new Promise(resolve => {
          resolveNetworkPromise = resolve;
        });

        // $FlowExpectedError Expando to annotate Promises.
        networkPromise.displayName =
          'Relay(' + operation.fragment.node.name + ')';

        cacheEntry = createCacheEntry(
          cacheKey,
          operation,
          networkPromise,
          networkSubscription,
          this._clearCacheEntry,
        );
        this._cache.set(cacheKey, cacheEntry);
      }
    } else {
      const observerComplete = observer?.complete;
      observerComplete && observerComplete();
    }
    const cacheEntry = this._cache.get(cacheKey);
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
};
