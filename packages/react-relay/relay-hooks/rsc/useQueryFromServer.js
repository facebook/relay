/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use client';
'use strict';

import type {
  PreloadedQueryRef,
  PreloadedQueryResponse,
} from './serverPreloadQuery';
import type {Query, Variables} from 'relay-runtime';

const usePreloadedQuery = require('../usePreloadedQuery');
const useRelayEnvironment = require('../useRelayEnvironment');
const invariant = require('invariant');
// $FlowFixMe[missing-export] React.use is available in React 19+
const {use, useMemo} = require('react');
const {
  Environment: RelayModernEnvironment,
  createOperationDescriptor,
  getRequest,
} = require('relay-runtime');

// $FlowFixMe[unclear-type] WeakSet used for identity-based dedup only
const committedRefs: WeakSet<any> = new WeakSet();

const DEFAULT_STALE_MS = 30_000;

hook useQueryFromServer<TVariables extends Variables, TData>(
  query: Query<TVariables, TData>,
  queryRef: PreloadedQueryRef<TVariables, TData>,
  options?: {staleThresholdMs?: number},
): TData {
  const environment = useRelayEnvironment();
  const request = getRequest(query);
  const threshold = options?.staleThresholdMs ?? DEFAULT_STALE_MS;

  const response: PreloadedQueryResponse<TData> = use(queryRef._response);

  const isFresh =
    response.data != null && Date.now() - queryRef.fetchedAt <= threshold;

  const shouldCommit = isFresh && !committedRefs.has(queryRef);

  // Publish server data to the Relay store without notifying subscribers.
  // This avoids the React "Cannot update a component while rendering a
  // different component" error that occurs when store.notify() triggers
  // setState in other mounted components that subscribe to overlapping records.

  // `publishWithDeferredNotify` is on RelayModernEnvironment rather than
  // IEnvironment while the API is experimental.
  invariant(
    environment instanceof RelayModernEnvironment,
    'useQueryFromServer: expected a RelayModernEnvironment, got `%s`. ' +
      'useQueryFromServer is currently only compatible with RelayModernStore.',
    environment.constructor?.name ?? typeof environment,
  );

  if (shouldCommit) {
    committedRefs.add(queryRef);

    const operation = createOperationDescriptor(request, queryRef.variables);

    // $FlowFixMe[unclear-type]
    const responsePayload: any = {
      data: response.data,
      errors: response.errors,
    };
    // The notify is not flushed here; it lands on the next `run()`.
    environment.publishWithDeferredNotify(operation, responsePayload);
  }

  // Build a PreloadedQuery shim. Fresh data was committed to the store
  // above, so source is null and fetchPolicy is "store-or-network".
  // Stale path uses "network-only" to trigger a client-side refetch.
  const preloadedQuery = useMemo(() => {
    const isFreshAtMemo =
      response.data != null && Date.now() - queryRef.fetchedAt <= threshold;

    // If this queryRef was already committed to the store by a previous
    // component instance, read from the store even if the server timestamp
    // is past the staleness threshold. This prevents a network refetch
    // from overwriting store mutations made after the initial commit.
    const useStore = isFreshAtMemo || committedRefs.has(queryRef);

    return {
      kind: 'PreloadedQuery_DEPRECATED',
      environment,
      fetchKey: queryRef.fetchedAt,
      fetchPolicy: useStore ? 'store-or-network' : 'network-only',
      id: request.params.id ?? request.params.name,
      name: request.params.name,
      source: null,
      variables: queryRef.variables,
    };
  }, [
    environment,
    queryRef.fetchedAt,
    response.data,
    queryRef.variables,
    request.params.id,
    request.params.name,
    threshold,
  ]);

  // usePreloadedQuery expects an opaque PreloadedQuery that can only be
  // created via loadQuery/useQueryLoader. There's no public API to create
  // one from server-fetched data, so we construct a plain object with the
  // fields usePreloadedQuery reads internally.
  // $FlowFixMe[incompatible-call]
  // $FlowFixMe[incompatible-type]
  return usePreloadedQuery(query, preloadedQuery);
}

module.exports = useQueryFromServer;
