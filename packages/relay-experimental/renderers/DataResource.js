/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const LRUCache = require('../utils/LRUCache');
const React = require('React');

const getQueryIdentifier = require('../helpers/getQueryIdentifier');
const invariant = require('invariant');
const mapObject = require('mapObject');

// TODO: This should probably be configurable based on the environment
const CACHE_CAPACITY = 1000;
const DEFAULT_FETCH_POLICY = 'store-or-network';

const {
  fetchQuery,
  getPromiseForRequestInFlight,
} = require('../utils/fetchQueryUtils');
const {
  getDataIDsFromObject,
  getSelectorsFromObject,
  getVariablesFromObject,
} = require('relay-runtime');

import type {
  ConcreteFragment,
  Disposable,
  IEnvironment,
  OperationSelector,
  Selector,
  Snapshot,
  Variables,
} from 'relay-runtime';

type CachedValue = Error | Promise<void> | Snapshot | $ReadOnlyArray<Snapshot>;
type CacheReadResult = {
  snapshot: Snapshot | $ReadOnlyArray<Snapshot>,
  data: mixed,
  fetchDisposable: Disposable | null,
};

export type FetchPolicy =
  | 'store-only'
  | 'store-or-network'
  | 'store-and-network'
  | 'network-only';

type ReadQueryArgs = {|
  environment: IEnvironment,
  query: OperationSelector,
  fetchPolicy: ?FetchPolicy,
|};

type ReadFragmentSpecArgs = {|
  environment: IEnvironment,
  variables: Variables,
  fragmentNodes: {[key: string]: ConcreteFragment},
  fragmentRefs: {[string]: mixed},
  parentQuery: ?OperationSelector,
|};

type PreloadQueryArgs = {|
  environment: IEnvironment,
  query: OperationSelector,
  fetchPolicy?: FetchPolicy,
|};

type InvalidateQueryArgs = {|
  query: OperationSelector,
  fetchPolicy: ?FetchPolicy,
|};

type InvalidateFragmentArgs = {|
  fragmentNode: ConcreteFragment,
  fragmentRef: mixed,
  variables: Variables,
|};

type InvalidateFragmentSpecArgs = {|
  fragmentNodes: {[key: string]: ConcreteFragment},
  fragmentRefs: {[string]: mixed},
  variables: Variables,
|};

type SetQueryArgs = {|
  query: OperationSelector,
  fetchPolicy: ?FetchPolicy,
  snapshot: Snapshot,
|};

type SetFragmentArgs = {|
  fragmentNode: ConcreteFragment,
  fragmentRef: mixed,
  variables: Variables,
  snapshot: Snapshot | $ReadOnlyArray<Snapshot>,
|};

export type TDataResourceCache = {|
  clear(): void,
  readQuery(args: ReadQueryArgs): CacheReadResult,
  readFragmentSpec(
    args: ReadFragmentSpecArgs,
  ): {[string]: CacheReadResult | null},
  preloadQuery(args: PreloadQueryArgs): Disposable,
  invalidateQuery(args: InvalidateQueryArgs): void,
  invalidateFragment(args: InvalidateFragmentArgs): void,
  invalidateFragmentSpec(args: InvalidateFragmentSpecArgs): void,
  setQuery(args: SetQueryArgs): void,
  setFragment(args: SetFragmentArgs): void,
|};

const DATA_RETENTION_TIMEOUT = 30 * 1000;

function getQueryCacheKey(
  query: OperationSelector,
  fetchPolicy: FetchPolicy,
): string {
  return `${fetchPolicy}-${getQueryIdentifier(query)}`;
}

function getFragmentCacheKey(
  fragmentNode: ConcreteFragment,
  fragmentRef: mixed,
  variables: Variables,
): string {
  const fragmentVariables = getVariablesFromObject(
    variables,
    {[fragmentNode.name]: fragmentNode},
    {[fragmentNode.name]: fragmentRef},
  );
  const dataIDs = getDataIDsFromObject(
    {[fragmentNode.name]: fragmentNode},
    {[fragmentNode.name]: fragmentRef},
  );
  return JSON.stringify({
    dataIDs,
    fragmentVariables,
  });
}

function isMissingData(snapshot: Snapshot | $ReadOnlyArray<Snapshot>) {
  if (Array.isArray(snapshot)) {
    return snapshot.some(s => s.isMissingData);
  }
  return snapshot.isMissingData;
}

function createCache(): TDataResourceCache {
  const cache = LRUCache.create<CachedValue>(CACHE_CAPACITY);

  /**
   * Attempts to read, fetch, retain and store data for a query, based on the
   * provided fetchPolicy. When reading data from the store, we will eagerly
   * read as much data from the store as is available locally for the query.
   *
   * FetchPolicy:
   * - store-only:
   *   - Will read the query from the Relay Store and save the result to cache.
   *   - It will not make any network requests
   *   - It will throw an error if there are no pending network requests
   * - store-or-network:
   *   - Will read the query from the Relay Store and save the result to cache.
   *   - If data for the **full** query is available locally, it will not make
   *     any network requests.
   *   - If not, it will attempt to fetch the query from the network.
   * - store-and-network:
   *   - Will read the query from the Relay Store and save the result to cache.
   *   - Additionally, it will always attempt to fetch the query.
   * - network-only:
   *   - Will only attempt to fetch the query without reading from the
   *     Relay Store.
   *
   * fetchQuery will de-dupe requests that are in flight (globally) by default.
   * This function will save the result from the network fetch to the cache:
   *   - If result from network is available synchronously, it will be saved
   *     to cache.
   *   - If result from network is not available synchronously, a Promise
   *     for the request will be saved to cache.
   *   - When the request completes, the result or the error will be saved to
   *     to cache.
   *
   * After the request completes, this function will release the retained data
   * after some period of time determined by DATA_RETENTION_TIMEOUT.
   * The timeout can be cleared by the Disposable returned by this function.
   */
  function fetchAndSaveQuery(args: {|
    environment: IEnvironment,
    query: OperationSelector,
    fetchPolicy: FetchPolicy,
  |}): Disposable {
    const {environment, query, fetchPolicy} = args;
    const cacheKey = getQueryCacheKey(query, fetchPolicy);

    // NOTE: Running `check` will write missing data to the store using any
    // missing data handlers specified on the environment;
    // We run it here first to make the handlers get a chance to populate
    // missing data.
    const hasFullQuery = environment.check(query.root);

    let shouldFetch;
    switch (fetchPolicy) {
      case 'store-only': {
        shouldFetch = false;
        const snapshot = environment.lookup(query.fragment);
        if (!isMissingData(snapshot)) {
          cache.set(cacheKey, snapshot);
          break;
        }
        // Check if there's a global request in flight for this query, even
        // if one won't be initiated by the component associated with this render.
        // It is possible for queries to be fetched completely outside of React
        // rendering, which is why we check if a request is in flight globally
        // for this query.
        const promiseForQuery = getPromiseForQueryRequestInFlight({
          environment,
          query,
          fetchPolicy,
        });
        if (promiseForQuery != null) {
          cache.set(cacheKey, promiseForQuery);
          break;
        }
        throw new Error(
          'DataResource: Tried reading a query that is not available ' +
            'locally and is not being fetched.',
        );
      }
      case 'store-or-network': {
        shouldFetch = !hasFullQuery;
        const snapshot = environment.lookup(query.fragment);
        if (!isMissingData(snapshot)) {
          cache.set(cacheKey, snapshot);
        }
        break;
      }
      case 'store-and-network': {
        shouldFetch = true;
        const snapshot = environment.lookup(query.fragment);
        if (!isMissingData(snapshot)) {
          cache.set(cacheKey, snapshot);
        }
        break;
      }
      case 'network-only':
      default: {
        shouldFetch = true;
        break;
      }
    }

    let releaseDataTimeoutID = null;
    let disposable: ?Disposable = null;
    if (shouldFetch) {
      let resolveSuspender = () => {};
      let error = null;
      disposable = fetchQuery({
        environment,
        query,
        networkLayerCacheConfig: {force: true},
        observer: {
          complete: () => {
            // NOTE: fetchQuery_UNSTABLE retains data in the Relay store by default.
            // We dispose of it eventually here since the component associated
            // with this request might never mount. If it does mount, it will
            // retain the data and release it on unmount, so we try to give it
            // enough time to mount here.
            // If the component never mounts, we ensure here the data is eventually
            // released.
            releaseDataTimeoutID = setTimeout(() => {
              if (disposable) {
                disposable.dispose();
                disposable = null;
              }
            }, DATA_RETENTION_TIMEOUT);
            resolveSuspender();
          },
          next: () => {
            const snapshot = environment.lookup(query.fragment);
            if (!isMissingData(snapshot)) {
              cache.set(cacheKey, snapshot);
              resolveSuspender();
            }
          },
          error: e => {
            error = e;
            if (disposable) {
              disposable.dispose();
              disposable = null;
            }
            cache.set(cacheKey, error);
            resolveSuspender();
          },
        },
      });
      if (!cache.has(cacheKey)) {
        const suspender = new Promise(resolve => {
          resolveSuspender = resolve;
        });
        cache.set(cacheKey, suspender);
      }
    }
    return {
      // Dispose should be called by the component when it mounts.
      // The expectation is that the component will retain the data for the
      // query separately, and thus can allow this fetch call to stop retaining it
      dispose: () => {
        if (releaseDataTimeoutID) {
          if (disposable) {
            disposable.dispose();
          }
          clearTimeout(releaseDataTimeoutID);
        }
      },
    };
  }

  /**
   * Checks if a request for a query is in flight globally, and if so, returns
   * a Promise for that query.
   * Before the promise resolves, it will store in cache the latest data from
   * the Relay store for the query, or an error if one occurred during the
   * request.
   */
  function getPromiseForQueryRequestInFlight(args: {|
    environment: IEnvironment,
    query: OperationSelector,
    fetchPolicy: FetchPolicy,
  |}): Promise<void> | null {
    const {environment, query, fetchPolicy} = args;
    const promise = getPromiseForRequestInFlight({
      environment,
      query,
    });
    if (!promise) {
      return null;
    }

    const cacheKey = getQueryCacheKey(query, fetchPolicy);
    // When the Promise for the request resolves, we need to make sure to
    // update the cache with the latest data available in the store before
    // resolving the Promise
    return promise
      .then(() => {
        const latestSnapshot = environment.lookup(query.fragment);
        if (!isMissingData(latestSnapshot)) {
          cache.set(cacheKey, latestSnapshot);
        } else {
          cache.delete(cacheKey);
        }
      })
      .catch(error => {
        cache.set(cacheKey, error);
      });
  }

  /**
   * Checks if a request for a the parent query for a fragment is in flight
   * globally, and if so, returns a Promise for that query.
   * Before the promise resolves, it will store in cache the latest data from
   * the Relay store for the fragment, or an error if one occurred during the
   * request.
   */
  function getPromiseForFragmentRequestInFlight(args: {|
    environment: IEnvironment,
    fragmentNode: ConcreteFragment,
    fragmentRef: mixed,
    fragmentSelector: Selector | $ReadOnlyArray<Selector>,
    parentQuery: OperationSelector,
  |}): Promise<void> | null {
    const {
      environment,
      fragmentNode,
      fragmentRef,
      fragmentSelector,
      parentQuery,
    } = args;
    const promise = getPromiseForRequestInFlight({
      environment,
      query: parentQuery,
    });
    if (!promise) {
      return null;
    }

    const cacheKey = getFragmentCacheKey(
      fragmentNode,
      fragmentRef,
      parentQuery.variables,
    );
    // When the Promise for the request resolves, we need to make sure to
    // update the cache with the latest data available in the store before
    // resolving the Promise
    return promise
      .then(() => {
        const latestSnapshot = Array.isArray(fragmentSelector)
          ? fragmentSelector.map(s => environment.lookup(s))
          : environment.lookup(fragmentSelector);
        if (!isMissingData(latestSnapshot)) {
          cache.set(cacheKey, latestSnapshot);
        }
      })
      .catch(error => {
        cache.set(cacheKey, error);
      });
  }

  /**
   * Builds a result to return when reading from this cache.
   * The result includes:
   * - The Relay store Snapshot, which is necessary if callers want to
   *   subscribe to the snapshot's data.
   * - The actual data from the Snapshot.
   */
  function makeDataResult(args: {|
    snapshot: Snapshot | $ReadOnlyArray<Snapshot>,
    fetchDisposable?: Disposable,
  |}): CacheReadResult {
    const {fetchDisposable, snapshot} = args;
    return {
      data: Array.isArray(snapshot)
        ? snapshot.map(({data}) => data)
        : snapshot.data,
      fetchDisposable: fetchDisposable ?? null,
      snapshot,
    };
  }

  return {
    clear() {
      cache.clear();
    },

    /**
     * Attempts to read data from the render cache.
     * - When a cached value is available:
     *   - If value is a Promise or Error, it will be thrown.
     *   - Otherwise, return it.
     * - When a cached value is NOT available:
     *   - Attempts to read from Relay Store, and caches data if it's in the store.
     *   - If data not present, check if request is in flight, if so throw
     *     Promise for that request
     *   - Otherwise, return empty data.
     */
    readQuery(args: ReadQueryArgs): CacheReadResult {
      const {query} = args;
      const fetchPolicy = args.fetchPolicy ?? DEFAULT_FETCH_POLICY;
      const cacheKey = getQueryCacheKey(query, fetchPolicy);

      // 1. Check if there's a cached value for this query
      let cachedValue = cache.get(cacheKey);
      if (cachedValue != null) {
        if (cachedValue instanceof Promise || cachedValue instanceof Error) {
          throw cachedValue;
        }
        return makeDataResult({
          snapshot: cachedValue,
        });
      }

      // 2. If a cached value isn't available, try fetching the query.
      // fetchAndSaveQuery will update the cache with either a Promise, Error
      // or a Snapshot
      const fetchDisposable = fetchAndSaveQuery({
        environment: args.environment,
        query: args.query,
        fetchPolicy,
      });
      cachedValue = cache.get(cacheKey);
      if (cachedValue != null) {
        if (cachedValue instanceof Promise || cachedValue instanceof Error) {
          throw cachedValue;
        }
        return makeDataResult({
          snapshot: cachedValue,
          fetchDisposable,
        });
      }

      // 3. If a cached value still isn't available, throw an error.
      // This means that we're trying to read a query that isn't available and
      // isn't being fetched at all.
      // This can happen if the fetchPolicy policy is store-only
      throw new Error(
        'DataResource: Tried reading a query that is not available locally and is not being fetched',
      );
    },

    readFragmentSpec(
      args: ReadFragmentSpecArgs,
    ): {[string]: CacheReadResult | null} {
      const {
        environment,
        variables,
        fragmentNodes,
        fragmentRefs,
        parentQuery,
      } = args;

      const selectorsByFragment = getSelectorsFromObject(
        variables,
        fragmentNodes,
        fragmentRefs,
      );
      return mapObject(fragmentNodes, (fragmentNode, key) => {
        const fragmentRef = fragmentRefs[key];
        if (fragmentRef == null) {
          return null;
        }
        const cacheKey = getFragmentCacheKey(
          fragmentNode,
          fragmentRef,
          variables,
        );
        const cachedValue = cache.get(cacheKey);

        // 1. Check if there's a cached value for this fragment
        if (cachedValue != null) {
          if (cachedValue instanceof Promise || cachedValue instanceof Error) {
            throw cachedValue;
          }
          return makeDataResult({
            snapshot: cachedValue,
          });
        }

        // 2. If not, try reading the fragment from the Relay store.
        // If the snapshot has data, return it and save it in cache
        const fragmentSelector: ?(Selector | $ReadOnlyArray<Selector>) =
          selectorsByFragment[key];
        invariant(
          fragmentSelector != null,
          'DataResource: Expected to have received a valid fragment reference',
        );
        const snapshot = Array.isArray(fragmentSelector)
          ? fragmentSelector.map(s => environment.lookup(s))
          : environment.lookup(fragmentSelector);
        if (!isMissingData(snapshot)) {
          cache.set(cacheKey, snapshot);
          return makeDataResult({
            snapshot,
          });
        }

        // 3. If we don't have data in the store, check if a request is in
        // flight for the fragment's parent query. If so, suspend with the Promise
        // for that request.
        invariant(
          parentQuery != null,
          'DataResource: Tried reading a fragment that ' +
            "doesn't have a parent query.",
        );
        const suspender = getPromiseForFragmentRequestInFlight({
          environment,
          fragmentNode,
          fragmentRef,
          fragmentSelector,
          parentQuery,
        });
        if (suspender != null) {
          throw suspender;
        }

        // 3. If a cached value still isn't available, throw an error.
        // This means that we're trying to read a query that isn't available and
        // isn't being fetched at all.
        // This can happen if the fetchPolicy policy is store-only
        throw new Error(
          'DataResource: Tried reading a fragment that has ' +
            'missing data and is not being fetched.',
        );
      });
    },

    /**
     * If a query isn't already saved in cache, attempts to fetch, retain and
     * store data for a query, based on the provided data access policy.
     * See: fetchAndSaveQuery.
     */
    preloadQuery(args: PreloadQueryArgs): Disposable {
      const {environment, query} = args;
      const fetchPolicy = args.fetchPolicy ?? DEFAULT_FETCH_POLICY;
      const cacheKey = getQueryCacheKey(query, fetchPolicy);
      if (cache.has(cacheKey)) {
        return {dispose: () => {}};
      }
      return fetchAndSaveQuery({
        environment,
        query,
        fetchPolicy,
      });
    },

    /**
     * Removes entry for query from cache
     */
    invalidateQuery(args: InvalidateQueryArgs) {
      const {query} = args;
      const fetchPolicy = args.fetchPolicy ?? DEFAULT_FETCH_POLICY;
      const cacheKey = getQueryCacheKey(query, fetchPolicy);
      cache.delete(cacheKey);
    },

    /**
     * Removes entry for fragment from cache
     */
    invalidateFragment(args: InvalidateFragmentArgs): void {
      const {fragmentNode, fragmentRef, variables} = args;
      const cacheKey = getFragmentCacheKey(
        fragmentNode,
        fragmentRef,
        variables,
      );
      cache.delete(cacheKey);
    },

    /**
     * Removes entry for each provided fragment from cache
     */
    invalidateFragmentSpec(args: InvalidateFragmentSpecArgs): void {
      const {fragmentNodes, fragmentRefs, variables} = args;
      Object.keys(fragmentNodes).forEach(key => {
        const fragmentNode = fragmentNodes[key];
        const fragmentRef = fragmentRefs[key];
        invariant(
          fragmentNode != null,
          'RenderDataResource: Expected fragment to be defined',
        );

        const cacheKey = getFragmentCacheKey(
          fragmentNode,
          fragmentRef,
          variables,
        );
        cache.delete(cacheKey);
      });
    },

    /**
     * Sets snapshot for query in cache if data in snapshot isn't empty
     */
    setQuery(args: SetQueryArgs): void {
      const {query, snapshot} = args;
      const fetchPolicy = args.fetchPolicy ?? DEFAULT_FETCH_POLICY;
      if (!isMissingData(snapshot)) {
        const cacheKey = getQueryCacheKey(query, fetchPolicy);
        cache.set(cacheKey, snapshot);
      }
    },

    /**
     * Sets snapshot in cache for provided fragment if data in snapshot
     * isn't empty
     */
    setFragment(args: SetFragmentArgs): void {
      const {fragmentNode, fragmentRef, variables, snapshot} = args;
      if (!isMissingData(snapshot)) {
        const cacheKey = getFragmentCacheKey(
          fragmentNode,
          fragmentRef,
          variables,
        );
        cache.set(cacheKey, snapshot);
      }
    },
  };
}

const cachesByEnvironment: Map<IEnvironment, TDataResourceCache> = new Map();
function getCacheForEnvironment(environment: IEnvironment): TDataResourceCache {
  let cache = cachesByEnvironment.get(environment);
  if (cache) {
    return cache;
  }
  cache = createCache();
  cachesByEnvironment.set(environment, cache);
  return cache;
}

const globalCache = createCache();
const DataResourceContext = React.createContext<TDataResourceCache>(
  globalCache,
);

module.exports = {
  createCache,
  getCacheForEnvironment,
  globalCache,
  DataResourceContext,
};
