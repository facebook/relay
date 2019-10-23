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

'use strict';

const ExecutionEnvironment = require('fbjs/lib/ExecutionEnvironment');

const invariant = require('invariant');

const {
  Environment,
  Observable,
  ReplaySubject,
  createOperationDescriptor,
  getRequestIdentifier,
} = require('relay-runtime');

import type {
  PreloadableConcreteRequest,
  PreloadedQuery,
  PreloadFetchPolicy,
  PreloadOptions,
} from './EntryPointTypes.flow';
import type {
  GraphQLResponse,
  IEnvironment,
  OperationType,
  Subscription,
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
      subject: ReplaySubject<GraphQLResponse>,
      subscription: Subscription,
    |}>
  | $ReadOnly<{|
      cacheKey: string,
      fetchKey: ?string | ?number,
      fetchPolicy: PreloadFetchPolicy,
      kind: 'cache',
    |}>;

function preloadQuery<TQuery: OperationType, TEnvironmentProviderOptions>(
  environment: IEnvironment,
  preloadableRequest: PreloadableConcreteRequest<TQuery>,
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
    name: preloadableRequest.params.name,
    source,
    variables,
  };
}

function preloadQueryDeduped<TQuery: OperationType>(
  environment: Environment,
  pendingQueries: Map<string, PendingQueryEntry>,
  preloadableRequest: PreloadableConcreteRequest<TQuery>,
  variables: $ElementType<TQuery, 'variables'>,
  options: ?PreloadOptions,
): PendingQueryEntry {
  const {params} = preloadableRequest;
  const network = environment.getNetwork();
  const fetchPolicy = options?.fetchPolicy ?? STORE_OR_NETWORK_DEFAULT;
  const fetchKey = options?.fetchKey;
  const cacheKey = `${getRequestIdentifier(params, variables)}${
    fetchKey != null ? `-${fetchKey}` : ''
  }`;
  const prevQueryEntry = pendingQueries.get(cacheKey);
  const query = preloadableRequest.getModuleIfRequired();

  const shouldFulfillFromCache =
    fetchPolicy === STORE_OR_NETWORK_DEFAULT &&
    query != null &&
    (prevQueryEntry?.kind === 'cache' ||
      environment.check(createOperationDescriptor(query, variables).root));

  let nextQueryEntry;
  if (shouldFulfillFromCache) {
    nextQueryEntry =
      prevQueryEntry && prevQueryEntry.kind === 'cache'
        ? prevQueryEntry
        : {
            cacheKey,
            fetchKey,
            fetchPolicy,
            kind: 'cache',
          };
    if (ExecutionEnvironment.canUseDOM && prevQueryEntry == null) {
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
    const source = network.execute(params, variables, {}, null, logRequestInfo);
    const subject = new ReplaySubject();
    nextQueryEntry = {
      cacheKey,
      fetchKey,
      fetchPolicy,
      kind: 'network',
      subject,
      subscription: source
        .finally(() => {
          if (!ExecutionEnvironment.canUseDOM) {
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
