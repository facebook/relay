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

const React = require('React');
const RelayCore = require('relay-runtime/store/RelayCore');

const checkQuery_UNSTABLE = require('../helpers/checkQuery_UNSTABLE');
const getRequestKey_UNSTABLE = require('../helpers/getRequestKey_UNSTABLE');
const invariant = require('invariant');
const mapObject = require('mapObject');
const readFragment_UNSTABLE = require('../helpers/readFragment_UNSTABLE');
const readQuery_UNSTABLE = require('../helpers/readQuery_UNSTABLE');

const {
  fetchQuery_UNSTABLE,
  getPromiseForRequestInFlight_UNSTABLE,
} = require('../helpers/fetchQuery_UNSTABLE');

import type {
  Disposable,
  GraphQLTaggedNode,
  IEnvironment,
  Snapshot,
  Variables,
} from 'relay-runtime';

type CachedValue = Error | Promise<void> | Snapshot | $ReadOnlyArray<Snapshot>;
type CacheReadResult = {
  snapshot: Snapshot | $ReadOnlyArray<Snapshot>,
  data: mixed,
  fetchDisposable: Disposable | null,
};

export type FragmentSpec = {[string]: GraphQLTaggedNode};
export type DataAccessPolicy =
  | 'STORE_ONLY'
  | 'STORE_OR_NETWORK'
  | 'STORE_THEN_NETWORK'
  | 'NETWORK_ONLY';

const {getFragment, getRequest} = RelayCore;

const DATA_RETENTION_TIMEOUT = 30 * 1000;

function getQueryCacheKey(
  query: GraphQLTaggedNode,
  variables: Variables,
): string {
  const requestNode = getRequest(query);
  return getRequestKey_UNSTABLE(requestNode, variables);
}

function getFragmentCacheKey(
  fragment: GraphQLTaggedNode,
  fragmentRef: mixed,
  variables: Variables,
): string {
  invariant(
    fragmentRef != null,
    'RenderDataResource: Expected fragmentRef to be provided',
  );
  const fragmentNode = getFragment(fragment);
  return `${fragmentNode.name}-${fragmentNode.type}-${JSON.stringify(
    fragmentRef,
  )}-${JSON.stringify(variables)}`;
}

function hasData(snapshot: Snapshot | $ReadOnlyArray<Snapshot>) {
  return (
    (Array.isArray(snapshot) && snapshot.every(s => s.data !== undefined)) ||
    (!Array.isArray(snapshot) && snapshot.data !== undefined)
  );
}

/**
 * Wraps data object in a Proxy to detect when callers try to access
 * non-existing fields.
 */
function proxyDataResult(
  data: mixed,
  onFieldMissing: (obj: {}, prop: string) => mixed,
): mixed {
  if (data == null) {
    return data;
  }
  if (typeof data === 'string' || typeof data === 'number') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(d => proxyDataResult(d, onFieldMissing));
  }

  // TODO Check if proxy is supported, if not use polyfill
  // $FlowExpectedError - Need to be dynamic in this case as we know that data is an object at this point
  const proxyTarget: {} = Object.isFrozen(data) ? {...data} : (data: any);
  return new Proxy(proxyTarget, {
    get: (obj, prop) => {
      // Don't attempt to proxy special Relay fields
      if (prop === '$refType' || prop === '$fragmentRefs') {
        return obj[prop];
      }
      const res = obj[prop];
      if (res === undefined) {
        onFieldMissing(obj, prop);
      }
      return proxyDataResult(res, onFieldMissing);
    },
  });
}

function createCache() {
  // TODO Make this LRU
  const cache: Map<string, CachedValue> = new Map();

  /**
   * Attempts to fetch, retain and store data for a query, based on the
   * provided data access policy:
   * - STORE_ONLY:
   *   - Will only read query from the Relay Store and save it to the cache if
   *     any data for the query is available
   * - STORE_OR_NETWORK:
   *   - Will check if data for //entire// query is available in store.
   *   - If so, will save it to cache and do nothing else.
   *   - If not, will attempt to fetch the query.
   * - STORE_THEN_NETWORK:
   *   - Will read query from the Relay Store and save it to the cache if
   *     any data for the query is available
   *   - Additionally, it will attempt fetch the query.
   * - NETWORK_ONLY:
   *   - Will only attempt to fetch the query.
   *
   * fetchQuery will de-dupe requests that are in flight (globally) by default.
   * This function will save the result from the network fetch to the cache:
   *   - If result from network is available syncrhonously, it will be saved
   *     to cache.
   *   - If result from network is not available syncrhonously, a Promise
   *     for the request will be saved to cache.
   *   - When the request completes, the result or the error will be saved to
   *     to cache.
   *
   * After the request completes, this function will release the retained data
   * after some period of time determined by DATA_RETENTION_TIMEOUT.
   * The timeout can be cleared by the Disposable returned by this function.
   */
  function fetchQuery(args: {|
    environment: IEnvironment,
    query: GraphQLTaggedNode,
    variables: Variables,
    dataAccess?: DataAccessPolicy,
  |}): Disposable {
    const {environment, query, variables} = args;
    const cacheKey = getQueryCacheKey(query, variables);
    const dataAccess = args.dataAccess ?? 'NETWORK_ONLY';
    let shouldFetch;
    switch (dataAccess) {
      case 'STORE_ONLY': {
        shouldFetch = false;
        const snapshot = readQuery_UNSTABLE(environment, query, variables);
        if (hasData(snapshot)) {
          cache.set(cacheKey, snapshot);
        } else {
          // Check if there's a global request in flight for this query, even
          // if one won't be initiated by the component associated with this render.
          // It is possible for queries to be fetched completely outside of React
          // rendering, which is why we check if a request is in flight globally
          // for this query.
          const promiseForQuery = getPromiseForQueryRequestInFlight({
            environment,
            query,
            variables,
          });
          if (promiseForQuery != null) {
            cache.set(cacheKey, promiseForQuery);
          }
        }
        break;
      }
      case 'STORE_OR_NETWORK': {
        const hasFullQuery = checkQuery_UNSTABLE(environment, query, variables);
        shouldFetch = hasFullQuery === false;
        if (hasFullQuery) {
          const snapshot = readQuery_UNSTABLE(environment, query, variables);
          cache.set(cacheKey, snapshot);
        }
        break;
      }
      case 'STORE_THEN_NETWORK': {
        shouldFetch = true;
        const snapshot = readQuery_UNSTABLE(environment, query, variables);
        if (hasData(snapshot)) {
          cache.set(cacheKey, snapshot);
        }
        break;
      }
      case 'NETWORK_ONLY':
      default: {
        shouldFetch = true;
        break;
      }
    }

    let releaseDataTimeoutID = null;
    let disposable: ?Disposable = null;
    if (shouldFetch) {
      let resolveSuspender = () => {};
      let snapshot = null;
      let error = null;
      disposable = fetchQuery_UNSTABLE({
        environment,
        query,
        variables,
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
            if (snapshot && hasData(snapshot)) {
              snapshot = readQuery_UNSTABLE(environment, query, variables);
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
    query: GraphQLTaggedNode,
    variables: Variables,
  |}): Promise<void> | null {
    const {environment, query, variables} = args;
    const promise = getPromiseForRequestInFlight_UNSTABLE({
      environment,
      query,
      variables,
    });
    if (!promise) {
      return null;
    }

    const cacheKey = getQueryCacheKey(query, variables);
    // When the Promise for the request resolves, we need to make sure to
    // update the cache with the latest data available in the store before
    // resolving the Promise
    return promise
      .then(() => {
        const latestSnapshot = readQuery_UNSTABLE(
          environment,
          query,
          variables,
        );
        if (hasData(latestSnapshot)) {
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
    fragment: GraphQLTaggedNode,
    fragmentRef: mixed,
    parentQuery: GraphQLTaggedNode,
    variables: Variables,
  |}): Promise<void> | null {
    const {environment, fragment, fragmentRef, parentQuery, variables} = args;
    const promise = getPromiseForRequestInFlight_UNSTABLE({
      environment,
      query: parentQuery,
      variables,
    });
    if (!promise) {
      return null;
    }

    const cacheKey = getFragmentCacheKey(fragment, fragmentRef, variables);
    // When the Promise for the request resolves, we need to make sure to
    // update the cache with the latest data available in the store before
    // resolving the Promise
    return promise
      .then(() => {
        const latestSnapshot = readFragment_UNSTABLE(
          environment,
          fragment,
          fragmentRef,
          variables,
        );
        if (hasData(latestSnapshot)) {
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
   * - The actual data from the Snapshot. This data is not simply the raw data;
   *   rather, it's wrapped in a Proxy to detect when callers try to access
   *   non-existing fields.
   *   If a caller accessess non-existing field on the data object, the proxy
   *   will:
   *   - Check if request is in flight, if so throw Promise for that request
   *   - Otherwise, return the empty data
   */
  function makeDataResult(args: {
    environment: IEnvironment,
    query: GraphQLTaggedNode,
    fragment?: GraphQLTaggedNode,
    fragmentRef?: mixed,
    variables: Variables,
    snapshot: Snapshot | $ReadOnlyArray<Snapshot>,
    fetchDisposable?: Disposable,
  }): CacheReadResult {
    const {
      environment,
      query,
      fetchDisposable,
      fragment,
      fragmentRef,
      variables,
      snapshot,
    } = args;
    invariant(
      hasData(snapshot),
      'DataResourceCache: Expected snapshot to have data when returning a result',
    );
    const handleFieldMissing = () => {
      if (fragment != null) {
        // Check if a request is in flight for the parent query  this field
        // belongs to.
        const suspender = getPromiseForFragmentRequestInFlight({
          environment,
          fragment,
          fragmentRef,
          parentQuery: query,
          variables,
        });
        if (suspender) {
          const cacheKey = getFragmentCacheKey(
            fragment,
            fragmentRef,
            variables,
          );
          cache.set(cacheKey, suspender);
          throw suspender;
        }

        // Otherwise, throw an error.
        // This means that we're trying to read a field that isn't available and
        // isn't being fetched at all.
        // This can happen if the dataAccess policy is STORE_ONLY
        throw new Error(
          'DataResourceCache_UNSTABLE: Tried reading a fragment that is not available locally and is not being fetched',
        );
      }
      // Check if a request is in flight for the query this field belongs to.
      const suspender = getPromiseForQueryRequestInFlight({
        environment,
        query,
        variables,
      });

      // If so, suspend with the Promise for that request
      if (suspender) {
        const cacheKey = getQueryCacheKey(query, variables);
        cache.set(cacheKey, suspender);
        throw suspender;
      }

      // Otherwise, throw an error.
      // This means that we're trying to read a field that isn't available and
      // isn't being fetched at all.
      // This can happen if the dataAccess policy is STORE_ONLY
      throw new Error(
        'DataResourceCache_UNSTABLE: Tried reading a query that is not available locally and is not being fetched',
      );
    };

    return {
      data: Array.isArray(snapshot)
        ? proxyDataResult(snapshot.map(s => s.data), handleFieldMissing)
        : proxyDataResult(snapshot.data, handleFieldMissing),
      fetchDisposable: fetchDisposable ?? null,
      snapshot,
    };
  }

  return {
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
    readQuery(args: {|
      environment: IEnvironment,
      query: GraphQLTaggedNode,
      variables: Variables,
      dataAccess?: DataAccessPolicy,
    |}): CacheReadResult {
      const {environment, query, variables} = args;
      const cacheKey = getQueryCacheKey(query, variables);

      // 1. Check if there's a cached value for this query
      let cachedValue = cache.get(cacheKey);
      if (cachedValue != null) {
        if (cachedValue instanceof Promise || cachedValue instanceof Error) {
          throw cachedValue;
        }
        return makeDataResult({
          environment,
          query,
          variables,
          snapshot: cachedValue,
        });
      }

      // 2. If a cached value isn't available, try fetching the query.
      // fetchQuery will update the cache with either a Promise, Error or a
      // Snapshot
      const fetchDisposable = fetchQuery(args);
      cachedValue = cache.get(cacheKey) ?? null;
      if (cachedValue != null) {
        if (cachedValue instanceof Promise || cachedValue instanceof Error) {
          throw cachedValue;
        }
        return makeDataResult({
          environment,
          query,
          variables,
          snapshot: cachedValue,
          fetchDisposable,
        });
      }

      // 3. If a cached value still isn't available, throw an error.
      // This means that we're trying to read a query that isn't available and
      // isn't being fetched at all.
      // This can happen if the dataAccess policy is STORE_ONLY
      throw new Error(
        'DataResourceCache_UNSTABLE: Tried reading a query that is not available locally and is not being fetched',
      );
    },

    readFragmentSpec(args: {|
      environment: IEnvironment,
      variables: Variables,
      fragmentSpec: FragmentSpec,
      fragmentRefs: {[string]: mixed},
      parentQuery: GraphQLTaggedNode,
    |}): {[string]: CacheReadResult} {
      const {
        environment,
        fragmentSpec,
        fragmentRefs,
        parentQuery,
        variables,
      } = args;
      return mapObject(fragmentSpec, (fragment, key) => {
        const fragmentRef = fragmentRefs[key];
        const cacheKey = getFragmentCacheKey(fragment, fragmentRef, variables);
        const cachedValue = cache.get(cacheKey) ?? null;

        // 1. Check if there's a cached value for this fragment
        if (cachedValue != null) {
          if (cachedValue instanceof Promise || cachedValue instanceof Error) {
            throw cachedValue;
          }
          return makeDataResult({
            environment,
            query: parentQuery,
            fragment,
            fragmentRef,
            variables,
            snapshot: cachedValue,
          });
        }

        // 2. If not, try reading the fragment from the Relay store.
        // If the snapshot has data, return it and save it in cache
        const snapshot = readFragment_UNSTABLE(
          environment,
          fragment,
          fragmentRef,
          variables,
        );
        if (hasData(snapshot)) {
          cache.set(cacheKey, snapshot);
          return makeDataResult({
            environment,
            query: parentQuery,
            fragment,
            fragmentRef,
            variables,
            snapshot,
          });
        }

        // 3. If we don't have data in the store, check if a request is in
        // flight for the fragment's parent query. If so, suspend with the Promise
        // for that request.
        const suspender = getPromiseForFragmentRequestInFlight({
          environment,
          fragment,
          fragmentRef,
          parentQuery,
          variables,
        });
        if (suspender != null) {
          throw suspender;
        }

        // 3. If a cached value still isn't available, throw an error.
        // This means that we're trying to read a query that isn't available and
        // isn't being fetched at all.
        // This can happen if the dataAccess policy is STORE_ONLY
        throw new Error(
          'DataResourceCache_UNSTABLE: Tried reading a fragment that is not available locally and is not being fetched',
        );
      });
    },

    /**
     * If a query isn't already saved in cache, attempts to fetch, retain and
     * store data for a query, based on the provided data access policy.
     * See: fetchQuery.
     */
    preloadQuery(args: {|
      environment: IEnvironment,
      query: GraphQLTaggedNode,
      variables: Variables,
      dataAccess?: DataAccessPolicy,
    |}): Disposable {
      const {environment, query, variables, dataAccess} = args;
      const cacheKey = getQueryCacheKey(query, variables);
      if (cache.has(cacheKey)) {
        return {dispose: () => {}};
      }
      return fetchQuery({environment, query, variables, dataAccess});
    },

    /**
     * Removes entry for query from cache
     */
    invalidateQuery(args: {|query: GraphQLTaggedNode, variables: Variables|}) {
      const {query, variables} = args;
      const cacheKey = getQueryCacheKey(query, variables);
      cache.delete(cacheKey);
    },

    /**
     * Removes entry for fragment from cache
     */
    invalidateFragment(args: {|
      fragment: GraphQLTaggedNode,
      fragmentRef: mixed,
      variables: Variables,
    |}): void {
      const {fragment, fragmentRef, variables} = args;
      const cacheKey = getFragmentCacheKey(fragment, fragmentRef, variables);
      cache.delete(cacheKey);
    },

    /**
     * Removes entry for each provided fragment from cache
     */
    invalidateFragmentSpec(args: {|
      fragmentSpec: FragmentSpec,
      fragmentRefs: {[string]: mixed},
      variables: Variables,
    |}): void {
      const {fragmentSpec, fragmentRefs, variables} = args;
      Object.keys(fragmentSpec).forEach(key => {
        const fragment = fragmentSpec[key];
        const fragmentRef = fragmentRefs[key];
        invariant(
          fragment != null,
          'RenderDataResource: Expected fragment to be defined',
        );

        const cacheKey = getFragmentCacheKey(fragment, fragmentRef, variables);
        cache.delete(cacheKey);
      });
    },

    /**
     * Sets snapshot for query in cache if data in snapshot isn't empty
     */
    setQuery(args: {|
      query: GraphQLTaggedNode,
      variables: Variables,
      snapshot: Snapshot,
    |}): void {
      const {query, snapshot, variables} = args;
      if (hasData(snapshot)) {
        const cacheKey = getQueryCacheKey(query, variables);
        cache.set(cacheKey, snapshot);
      }
    },

    /**
     * Sets snapshot in cache for provided fragment if data in snapshot
     * isn't empty
     */
    setFragment(args: {|
      fragment: GraphQLTaggedNode,
      fragmentRef: mixed,
      variables: Variables,
      snapshot: Snapshot | $ReadOnlyArray<Snapshot>,
    |}): void {
      const {fragment, fragmentRef, variables, snapshot} = args;
      if (hasData(snapshot)) {
        const cacheKey = getFragmentCacheKey(fragment, fragmentRef, variables);
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

export type TDataResourceCache = $Call<<R>(() => R) => R, typeof createCache>;

const globalCache = createCache();
const DataResourceCacheContext = React.createContext(globalCache);

module.exports = {
  createCache,
  getCacheForEnvironment,
  DataResourceCacheContext,
};
