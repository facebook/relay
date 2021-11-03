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

import type {
  PreloadableConcreteRequest,
  PreloadedQueryInner_DEPRECATED,
  PreloadFetchPolicy,
  PreloadOptions,
  PreloadQueryStatus,
  VariablesOf,
} from './EntryPointTypes.flow';
import type {
  ConcreteRequest,
  GraphQLResponse,
  GraphQLTaggedNode,
  IEnvironment,
  OperationType,
  Subscription,
} from 'relay-runtime';

const {
  Observable,
  PreloadableQueryRegistry,
  RelayFeatureFlags,
  ReplaySubject,
  createOperationDescriptor,
  getRequest,
  getRequestIdentifier,
} = require('relay-runtime');

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
  variables: VariablesOf<TQuery>,
  options?: ?PreloadOptions,
  environmentProviderOptions?: ?TEnvironmentProviderOptions,
): PreloadedQueryInner_DEPRECATED<TQuery, TEnvironmentProviderOptions> {
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
          let subscription;
          if (pendingQueries.get(queryEntry.cacheKey) == null) {
            const newQueryEntry = preloadQueryDeduped(
              environment,
              pendingQueries,
              preloadableRequest,
              variables,
              options,
            );
            if (newQueryEntry.kind === 'network') {
              subscription = newQueryEntry.subject.subscribe(sink);
            }
          } else {
            subscription = queryEntry.subject.subscribe(sink);
          }
          return () => {
            subscription?.unsubscribe();
            if (environment.isServer()) {
              return;
            }
            if (
              RelayFeatureFlags.DELAY_CLEANUP_OF_PENDING_PRELOAD_QUERIES ===
              true
            ) {
              setTimeout(() => {
                // Clear the cache entry after the default timeout
                // null-check for Flow
                if (queryEntry != null) {
                  cleanup(pendingQueries, queryEntry);
                }
              }, DEFAULT_PREFETCH_TIMEOUT);
            } else {
              cleanup(pendingQueries, queryEntry);
            }
          };
        })
      : null;
  return {
    kind: 'PreloadedQuery_DEPRECATED',
    environment,
    environmentProviderOptions,
    fetchKey: queryEntry.fetchKey,
    fetchPolicy: queryEntry.fetchPolicy,
    networkCacheConfig: options?.networkCacheConfig,
    id: queryEntry.id,
    name: queryEntry.name,
    source,
    variables,
    status: queryEntry.status,
  };
}

function preloadQueryDeduped<TQuery: OperationType>(
  environment: IEnvironment,
  pendingQueries: Map<string, PendingQueryEntry>,
  preloadableRequest: GraphQLTaggedNode | PreloadableConcreteRequest<TQuery>,
  variables: VariablesOf<TQuery>,
  options: ?PreloadOptions,
): PendingQueryEntry {
  let params;
  let query: ?ConcreteRequest;
  if (preloadableRequest.kind === 'PreloadableConcreteRequest') {
    const preloadableConcreteRequest: PreloadableConcreteRequest<TQuery> =
      (preloadableRequest: $FlowFixMe);
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
      ? environment.check(
          createOperationDescriptor(query, variables, networkCacheConfig),
        )
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
              fetchTime: availability?.fetchTime ?? null,
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
    const source = network.execute(params, variables, networkCacheConfig, null);
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
        fetchTime: null,
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
