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

const {getCacheForType, getCacheSignal} = require('./RelayReactCache');
const invariant = require('invariant');
const {
  __internal: {fetchQuery: fetchQueryInternal},
} = require('relay-runtime');
const warning = require('warning');

type QueryResult = {|
  fragmentNode: ReaderFragment,
  fragmentRef: mixed,
|};

// Note that the status of a cache entry will be 'resolved' when partial
// rendering is allowed, even if a fetch is ongoing. The pending status
// is specifically to indicate that we should suspend.
type QueryCacheEntry =
  | {|status: 'resolved', result: QueryResult|}
  | {|status: 'pending', promise: Promise<void>|}
  | {|status: 'rejected', error: Error|};

type QueryCache = Map<string, QueryCacheEntry>;

const DEFAULT_FETCH_POLICY = 'store-or-network';

function createQueryCache(): QueryCache {
  return new Map();
}

function getQueryCacheKey(
  operation: OperationDescriptor,
  fetchPolicy: FetchPolicy,
  renderPolicy: RenderPolicy,
  fetchKey?: ?string | ?number,
): string {
  const cacheIdentifier = `${fetchPolicy}-${renderPolicy}-${
    operation.request.identifier
  }-${fetchKey ?? ''}`;
  return cacheIdentifier;
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

function getQueryResultOrFetchQuery_REACT_CACHE(
  environment: IEnvironment,
  queryOperationDescriptor: OperationDescriptor,
  options?: {|
    fetchPolicy?: FetchPolicy,
    renderPolicy?: RenderPolicy,
    fetchKey?: ?string | ?number,
    fetchObservable?: Observable<GraphQLResponse>,
  |},
): QueryResult {
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

  let entry = cache.get(cacheKey);

  if (entry === undefined) {
    // Initiate a query to fetch the data if needed:
    entry = onCacheMiss(
      environment,
      queryOperationDescriptor,
      fetchPolicy,
      renderPolicy,
      newCacheEntry => {
        cache.set(cacheKey, newCacheEntry);
      },
      options?.fetchObservable,
    );
    cache.set(cacheKey, entry);

    // Since this is the first time rendering, retain the query. React will
    // trigger the abort signal when this cache entry is no longer needed.
    const retention = environment.retain(queryOperationDescriptor);
    const abortSignal = getCacheSignal();
    abortSignal.addEventListener(
      'abort',
      () => {
        retention.dispose();
        cache.delete(cacheKey);
      },
      {once: true},
    );
  }

  switch (entry.status) {
    case 'pending':
      throw entry.promise;
    case 'rejected':
      throw entry.error;
    case 'resolved':
      return entry.result;
  }
  invariant(false, 'switch statement should be exhaustive');
}

function onCacheMiss(
  environment: IEnvironment,
  operation: OperationDescriptor,
  fetchPolicy: FetchPolicy,
  renderPolicy: RenderPolicy,
  updateCache: QueryCacheEntry => void,
  customFetchObservable?: Observable<GraphQLResponse>,
): QueryCacheEntry {
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

  let cacheEntry;
  if (shouldFetch) {
    cacheEntry = executeOperationAndKeepUpToDate(
      environment,
      operation,
      updateCache,
      customFetchObservable,
    );
  }

  if (cacheEntry) {
    switch (cacheEntry.status) {
      case 'resolved':
        return cacheEntry;
      case 'rejected':
        return cacheEntry;
      case 'pending':
        return shouldRenderNow
          ? {status: 'resolved', result: constructQueryResult(operation)}
          : cacheEntry;
    }
  } else {
    invariant(
      shouldRenderNow,
      'Should either fetch or be willing to render. This is a bug in Relay.',
    );
    return {status: 'resolved', result: constructQueryResult(operation)};
  }
}

function executeOperationAndKeepUpToDate(
  environment: IEnvironment,
  operation: OperationDescriptor,
  updateCache: QueryCacheEntry => void,
  customFetchObservable?: Observable<GraphQLResponse>,
): QueryCacheEntry {
  let resolvePromise;
  const promise = new Promise(r => {
    resolvePromise = r;
  });
  // $FlowExpectedError[prop-missing] Expando to annotate Promises.
  promise.displayName = 'Relay(' + operation.request.node.operation.name + ')';

  let isFirstPayload = true;
  let entry:
    | {|error: Error, status: 'rejected'|}
    | {|result: QueryResult, status: 'resolved'|};

  // FIXME We may still need to cancel network requests for live queries.
  const fetchObservable =
    customFetchObservable ?? fetchQueryInternal(environment, operation);
  fetchObservable.subscribe({
    start: subscription => {},
    error: error => {
      if (isFirstPayload) {
        entry = {status: 'rejected', error};
        updateCache(entry);
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
      entry = {
        status: 'resolved',
        result: constructQueryResult(operation),
      };
      updateCache(entry);
      resolvePromise();
      isFirstPayload = false;
    },
    complete: () => {
      // FIXME I don't think we need to do anything further on complete.
      entry = {
        status: 'resolved',
        result: constructQueryResult(operation),
      };
      updateCache(entry);
      resolvePromise();
      isFirstPayload = false;
    },
  });

  return entry ?? {status: 'pending', promise};
}

module.exports = getQueryResultOrFetchQuery_REACT_CACHE;
