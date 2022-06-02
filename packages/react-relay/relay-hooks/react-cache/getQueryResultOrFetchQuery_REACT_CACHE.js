/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
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

import type {
  FetchPolicy,
  GraphQLResponse,
  IEnvironment,
  Observable,
  OperationDescriptor,
  ReaderFragment,
  RenderPolicy,
} from 'relay-runtime';

const SuspenseResource = require('../SuspenseResource');
const {getCacheForType, getCacheSignal} = require('./RelayReactCache');
const invariant = require('invariant');
const {
  RelayFeatureFlags,
  __internal: {fetchQuery: fetchQueryInternal},
} = require('relay-runtime');
const warning = require('warning');

type QueryCacheCommitable = () => () => void;

type QueryResult = {|
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
|};

// Note that the status of a cache entry will be 'resolved' when partial
// rendering is allowed, even if a fetch is ongoing. The pending status
// is specifically to indicate that we should suspend.
// Note also that the retainCount is different from the retain count of
// an operation, which is maintained by the Environment. This retain
// count is used in Legacy Timeouts mode to count how many components
// are mounted that use the entry, plus one count for the temporary retain
// before any components have mounted. It is unused when Legacy Timeouts
// mode is off.
type QueryCacheEntryStatus =
  | {|
      status: 'resolved',
      result: QueryResult,
    |}
  | {|
      status: 'pending',
      promise: Promise<void>,
    |}
  | {|
      status: 'rejected',
      error: Error,
    |};

type QueryCacheEntry = {|
  ...QueryCacheEntryStatus,
  onCommit: QueryCacheCommitable,
  suspenseResource: SuspenseResource | null,
|};

const DEFAULT_FETCH_POLICY = 'store-or-network';

type QueryCacheKey = string;

class QueryCache {
  _map: Map<IEnvironment, Map<QueryCacheKey, QueryCacheEntry>>;

  constructor() {
    this._map = new Map();
  }

  get(environment: IEnvironment, key: QueryCacheKey): QueryCacheEntry | void {
    let forEnv = this._map.get(environment);
    if (!forEnv) {
      forEnv = new Map();
      this._map.set(environment, forEnv);
    }
    return forEnv.get(key);
  }

  set(
    environment: IEnvironment,
    key: QueryCacheKey,
    value: QueryCacheEntry,
  ): void {
    let forEnv = this._map.get(environment);
    if (!forEnv) {
      forEnv = new Map();
      this._map.set(environment, forEnv);
    }
    forEnv.set(key, value);
  }

  delete(environment: IEnvironment, key: QueryCacheKey): void {
    const forEnv = this._map.get(environment);
    if (!forEnv) {
      return;
    }
    forEnv.delete(key);
    if (forEnv.size === 0) {
      this._map.delete(environment);
    }
  }
}

function createQueryCache(): QueryCache {
  return new QueryCache();
}

const noopOnCommit = () => {
  return () => undefined;
};

const noopPromise = new Promise(() => {});

function getQueryCacheKey(
  operation: OperationDescriptor,
  fetchPolicy: FetchPolicy,
  renderPolicy: RenderPolicy,
  fetchKey?: ?string | ?number,
): QueryCacheKey {
  return `${fetchPolicy}-${renderPolicy}-${operation.request.identifier}-${
    fetchKey ?? ''
  }`;
}

function constructQueryResult(operation: OperationDescriptor): QueryResult {
  const rootFragmentRef = {
    __id: operation.fragment.dataID,
    __fragments: {
      [operation.fragment.node.name]: operation.request.variables,
    },
    __fragmentOwner: operation.request,
  };
  return {
    fragmentNode: operation.request.node.fragment,
    fragmentRef: rootFragmentRef,
  };
}

function makeInitialCacheEntry() {
  return {
    status: 'pending',
    promise: noopPromise,
    onCommit: noopOnCommit,
    suspenseResource: null,
  };
}

function getQueryResultOrFetchQuery_REACT_CACHE(
  environment: IEnvironment,
  queryOperationDescriptor: OperationDescriptor,
  options?: {|
    fetchPolicy?: FetchPolicy,
    renderPolicy?: RenderPolicy,
    fetchKey?: ?string | ?number,
    fetchObservable?: Observable<GraphQLResponse>,
  |},
): [QueryResult, QueryCacheCommitable] {
  const fetchPolicy = options?.fetchPolicy ?? DEFAULT_FETCH_POLICY;
  const renderPolicy =
    options?.renderPolicy ?? environment.UNSTABLE_getDefaultRenderPolicy();

  const cache = getCacheForType(createQueryCache);

  const cacheKey = getQueryCacheKey(
    queryOperationDescriptor,
    fetchPolicy,
    renderPolicy,
    options?.fetchKey,
  );

  const initialEntry = cache.get(environment, cacheKey);

  function updateCache(
    updater: QueryCacheEntryStatus => QueryCacheEntryStatus,
  ) {
    let currentEntry = cache.get(environment, cacheKey);
    if (!currentEntry) {
      currentEntry = makeInitialCacheEntry();
      cache.set(environment, cacheKey, currentEntry);
    }
    // $FlowExpectedError[prop-missing] Extra properties are passed in -- this is fine
    const newStatus: {...} = updater(currentEntry);
    // $FlowExpectedError[cannot-spread-inexact] Flow cannot understand that this is valid...
    cache.set(environment, cacheKey, {...currentEntry, ...newStatus});
    // ... but we can because QueryCacheEntry spreads QueryCacheEntryStatus, so spreading
    // a QueryCacheEntryStatus into a QueryCacheEntry will result in a valid QueryCacheEntry.
  }

  // Initiate a query to fetch the data if needed:
  if (RelayFeatureFlags.USE_REACT_CACHE_LEGACY_TIMEOUTS) {
    let entry;
    if (initialEntry === undefined) {
      onCacheMiss(
        environment,
        queryOperationDescriptor,
        fetchPolicy,
        renderPolicy,
        updateCache,
        options?.fetchObservable,
      );
      const createdEntry = cache.get(environment, cacheKey);
      invariant(
        createdEntry !== undefined,
        'An entry should have been created by onCacheMiss. This is a bug in Relay.',
      );
      entry = createdEntry;
    } else {
      entry = initialEntry;
    }
    if (!entry.suspenseResource) {
      entry.suspenseResource = new SuspenseResource(() => {
        const retention = environment.retain(queryOperationDescriptor);
        return {
          dispose: () => {
            retention.dispose();
            cache.delete(environment, cacheKey);
          },
        };
      });
    }
    if (entry.onCommit === noopOnCommit) {
      entry.onCommit = () => {
        invariant(
          entry.suspenseResource,
          'SuspenseResource should have been initialized. This is a bug in Relay.',
        );
        const retention = entry.suspenseResource.permanentRetain(environment);
        return () => {
          retention.dispose();
        };
      };
    }
    entry.suspenseResource.temporaryRetain(environment);
  } else {
    if (initialEntry === undefined) {
      // This is the behavior we eventually want: We retain the query until the
      // presiding Cache component unmounts, at which point the AbortSignal
      // will be triggered.
      onCacheMiss(
        environment,
        queryOperationDescriptor,
        fetchPolicy,
        renderPolicy,
        updateCache,
        options?.fetchObservable,
      );

      // Since this is the first time rendering, retain the query. React will
      // trigger the abort signal when this cache entry is no longer needed.
      const retention = environment.retain(queryOperationDescriptor);

      const dispose = () => {
        retention.dispose();
        cache.delete(environment, cacheKey);
      };
      const abortSignal = getCacheSignal();
      abortSignal.addEventListener('abort', dispose, {once: true});
    }
  }

  const entry = cache.get(environment, cacheKey); // could be a different entry now if synchronously resolved
  invariant(
    entry !== undefined,
    'An entry should have been created by onCacheMiss. This is a bug in Relay.',
  );
  switch (entry.status) {
    case 'pending':
      throw entry.promise;
    case 'rejected':
      throw entry.error;
    case 'resolved':
      return [entry.result, entry.onCommit];
  }
  invariant(false, 'switch statement should be exhaustive');
}

function onCacheMiss(
  environment: IEnvironment,
  operation: OperationDescriptor,
  fetchPolicy: FetchPolicy,
  renderPolicy: RenderPolicy,
  updateCache: ((QueryCacheEntryStatus) => QueryCacheEntryStatus) => void,
  customFetchObservable?: Observable<GraphQLResponse>,
): void {
  // NB: Besides checking if the data is available, calling `check` will write missing
  // data to the store using any missing data handlers specified in the environment.
  const queryAvailability = environment.check(operation);
  const queryStatus = queryAvailability.status;
  const hasFullQuery = queryStatus === 'available';
  const canPartialRender =
    hasFullQuery || (renderPolicy === 'partial' && queryStatus !== 'stale');

  let shouldFetch;
  let shouldRenderNow;
  switch (fetchPolicy) {
    case 'store-only': {
      shouldFetch = false;
      shouldRenderNow = true;
      break;
    }
    case 'store-or-network': {
      shouldFetch = !hasFullQuery;
      shouldRenderNow = canPartialRender;
      break;
    }
    case 'store-and-network': {
      shouldFetch = true;
      shouldRenderNow = canPartialRender;
      break;
    }
    case 'network-only':
    default: {
      shouldFetch = true;
      shouldRenderNow = false;
      break;
    }
  }

  if (shouldFetch) {
    executeOperationAndKeepUpToDate(
      environment,
      operation,
      updateCache,
      customFetchObservable,
    );
    updateCache(existing => {
      switch (existing.status) {
        case 'resolved':
          return existing;
        case 'rejected':
          return existing;
        case 'pending':
          return shouldRenderNow
            ? {
                status: 'resolved',
                result: constructQueryResult(operation),
              }
            : existing;
      }
    });
  } else {
    invariant(
      shouldRenderNow,
      'Should either fetch or be willing to render. This is a bug in Relay.',
    );
    updateCache(_existing => ({
      status: 'resolved',
      result: constructQueryResult(operation),
    }));
  }
}

function executeOperationAndKeepUpToDate(
  environment: IEnvironment,
  operation: OperationDescriptor,
  updateCache: ((QueryCacheEntryStatus) => QueryCacheEntryStatus) => void,
  customFetchObservable?: Observable<GraphQLResponse>,
) {
  let resolvePromise;
  const promise = new Promise(r => {
    resolvePromise = r;
  });
  // $FlowExpectedError[prop-missing] Expando to annotate Promises.
  promise.displayName = 'Relay(' + operation.request.node.operation.name + ')';

  let isFirstPayload = true;

  // FIXME We may still need to cancel network requests for live queries.
  const fetchObservable =
    customFetchObservable ?? fetchQueryInternal(environment, operation);
  fetchObservable.subscribe({
    start: subscription => {},
    error: error => {
      if (isFirstPayload) {
        updateCache(_existing => ({
          status: 'rejected',
          error,
        }));
      } else {
        // TODO:T92030819 Remove this warning and actually throw the network error
        // To complete this task we need to have a way of precisely tracking suspendable points
        warning(
          false,
          'getQueryResultOrFetchQuery: An incremental payload for query `%` returned an error: `%`:`%`.',
          operation.request.node.operation.name,
          error.message,
          error.stack,
        );
      }
      resolvePromise();
      isFirstPayload = false;
    },
    next: response => {
      // Stop suspending on the first payload because of streaming, defer, etc.
      updateCache(_existing => ({
        status: 'resolved',
        result: constructQueryResult(operation),
      }));
      resolvePromise();
      isFirstPayload = false;
    },
  });

  // If the above subscription yields a value synchronously, then one of the updates
  // above will have already happened and we'll now be in a resolved or rejected state.
  // But in the usual case, we save the promise to the entry here:
  updateCache(existing =>
    existing.status === 'pending' ? {status: 'pending', promise} : existing,
  );
}

module.exports = getQueryResultOrFetchQuery_REACT_CACHE;
