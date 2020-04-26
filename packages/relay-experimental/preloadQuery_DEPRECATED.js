/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const PreloadableQueryRegistry = require('./PreloadableQueryRegistry');

const invariant = require('invariant');

const {
  createOperationDescriptor,
  Environment,
  getRequest,
  getRequestIdentifier,
  Observable,
  ReplaySubject,
} = require('relay-runtime');

import type {
  PreloadableConcreteRequest,
  PreloadedQuery,
  PreloadFetchPolicy,
  PreloadOptions,
  PreloadQueryStatus,
} from './EntryPointTypes.flow';
import type {
  ConcreteRequest,
  GraphQLResponse,
  GraphQLTaggedNode,
  IEnvironment,
  OperationType,
  Subscription,
  RequestParameters,
} from 'relay-runtime';

// Expire results by this delay after they resolve.
const DEFAULT_PREFETCH_TIMEOUT = 30 * 1000; // 30 seconds

const WEAKMAP_SUPPORTED = typeof WeakMap === 'function';
const STORE_OR_NETWORK_DEFAULT: PreloadFetchPolicy = 'store-or-network';

const pendingQueriesByEnvironment = WEAKMAP_SUPPORTED
  ? new WeakMap()
  : new Map();

type PendingQueryEntry =
  | $ReadOnly<{|
      cacheKey: string,
      fetchKey: ?string | ?number,
      fetchPolicy: PreloadFetchPolicy,
      kind: 'network',
      id: ?string,
      name: string,
      status: PreloadQueryStatus,
      subject: ReplaySubject<GraphQLResponse>,
      subscription: Subscription,
    |}>
  | $ReadOnly<{|
      cacheKey: string,
      fetchKey: ?string | ?number,
      fetchPolicy: PreloadFetchPolicy,
      kind: 'cache',
      id: ?string,
      name: string,
      status: PreloadQueryStatus,
    |}>;

function preloadQuery<TQuery: OperationType, TEnvironmentProviderOptions>(
  environment: IEnvironment,
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  variables: $ElementType<TQuery, 'variables'>,
  options?: ?PreloadOptions,
  environmentProviderOptions?: ?TEnvironmentProviderOptions,
): PreloadedQuery<TQuery, TEnvironmentProviderOptions> {
  invariant(
    environment instanceof Environment,
    'preloadQuery(): Expected a RelayModernEnvironment',
  );
  let _pendingQueries = pendingQueriesByEnvironment.get(environment);
  if (_pendingQueries == null) {
    _pendingQueries = new Map();
    pendingQueriesByEnvironment.set(environment, _pendingQueries);
  }
  const pendingQueries: Map<string, PendingQueryEntry> = _pendingQueries; // store in a const for flow
  const queryEntry = preloadQueryDeduped(
    environment,
    pendingQueries,
    preloadableRequest,
    variables,
    options,
  );
  const source =
    queryEntry.kind === 'network'
      ? Observable.create(sink => {
          const subscription = queryEntry.subject.subscribe(sink);
          return () => {
            subscription.unsubscribe();
            cleanup(pendingQueries, queryEntry);
          };
        })
      : null;
  return {
    environment,
    environmentProviderOptions,
    fetchKey: queryEntry.fetchKey,
    fetchPolicy: queryEntry.fetchPolicy,
    id: queryEntry.id,
    name: queryEntry.name,
    source,
    variables,
    status: queryEntry.status,
  };
}

function preloadQueryDeduped<TQuery: OperationType>(
  environment: Environment,
  pendingQueries: Map<string, PendingQueryEntry>,
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  variables: $ElementType<TQuery, 'variables'>,
  options: ?PreloadOptions,
): PendingQueryEntry {
  let params;
  let query: ?ConcreteRequest;
  if (preloadableRequest.kind === 'PreloadableConcreteRequest') {
    const preloadableConcreteRequest: PreloadableConcreteRequest<TQuery> = (preloadableRequest: $FlowFixMe);
    params = preloadableConcreteRequest.params;
    query = params.id != null ? PreloadableQueryRegistry.get(params.id) : null;
  } else {
    query = getRequest((preloadableRequest: $FlowFixMe));
    params = query.params;
  }
  const network = environment.getNetwork();
  const fetchPolicy = options?.fetchPolicy ?? STORE_OR_NETWORK_DEFAULT;
  const fetchKey = options?.fetchKey;
  const networkCacheConfig = {
    force: true,
    ...options?.networkCacheConfig,
  };
  const cacheKey = `${getRequestIdentifier(params, variables)}${
    fetchKey != null ? `-${fetchKey}` : ''
  }`;
  const prevQueryEntry = pendingQueries.get(cacheKey);

  const availability =
    fetchPolicy === STORE_OR_NETWORK_DEFAULT && query != null && query != null
      ? environment.check(createOperationDescriptor(query, variables))
      : {status: 'missing'};

  let nextQueryEntry: ?PendingQueryEntry;
  if (availability.status === 'available' && query != null) {
    nextQueryEntry =
      prevQueryEntry && prevQueryEntry.kind === 'cache'
        ? prevQueryEntry
        : {
            cacheKey,
            fetchKey,
            fetchPolicy,
            kind: 'cache',
            id: params.id,
            name: params.name,
            status: {
              cacheConfig: networkCacheConfig,
              source: 'cache',
              cacheTime: availability?.fetchTime ?? null,
            },
          };
    if (!environment.isServer() && prevQueryEntry == null) {
      setTimeout(() => {
        // Clear the cache entry after the default timeout
        // null-check for Flow
        if (nextQueryEntry != null) {
          cleanup(pendingQueries, nextQueryEntry);
        }
      }, DEFAULT_PREFETCH_TIMEOUT);
    }
  } else if (prevQueryEntry == null || prevQueryEntry.kind !== 'network') {
    // Should fetch but we're not already fetching: fetch!
    const [logObserver, logRequestInfo] = environment.__createLogObserver(
      params,
      variables,
    );
    const source = network.execute(
      params,
      variables,
      networkCacheConfig,
      null,
      logRequestInfo,
    );
    const subject = new ReplaySubject();
    nextQueryEntry = {
      cacheKey,
      fetchKey,
      fetchPolicy,
      kind: 'network',
      id: params.id,
      name: params.name,
      status: {
        cacheConfig: networkCacheConfig,
        source: 'network',
        cacheTime: null,
      },
      subject,
      subscription: source
        .finally(() => {
          if (environment.isServer()) {
            return;
          }
          setTimeout(() => {
            // Clear the cache entry after the default timeout
            // null-check for Flow
            if (nextQueryEntry != null) {
              cleanup(pendingQueries, nextQueryEntry);
            }
          }, DEFAULT_PREFETCH_TIMEOUT);
        })
        .do(logObserver)
        .subscribe({
          complete: () => {
            subject.complete();
          },
          error: error => {
            subject.error(error);
          },
          next: response => {
            subject.next(response);
          },
        }),
    };
  } else {
    nextQueryEntry = prevQueryEntry;
  }
  pendingQueries.set(cacheKey, nextQueryEntry);
  return nextQueryEntry;
}

function cleanup(
  pendingQueries: Map<string, PendingQueryEntry>,
  entry: PendingQueryEntry,
): void {
  // Reload the entry by its cache key and only invalidate if its the identical
  // entry instance. This ensures that if the same query/variables are fetched
  // successively that a timeout/expiration from an earlier fetch doesn't clear
  // a subsequent fetch.
  const currentEntry = pendingQueries.get(entry.cacheKey);
  if (currentEntry != null && currentEntry === entry) {
    if (currentEntry.kind === 'network') {
      currentEntry.subscription.unsubscribe();
    }
    pendingQueries.delete(currentEntry.cacheKey);
  }
}

module.exports = preloadQuery;
