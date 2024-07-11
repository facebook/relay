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

'use strict';

import type {
  CacheConfig,
  FetchPolicy,
  Query,
  RenderPolicy,
  Variables,
} from 'relay-runtime';

const {useTrackLoadQueryInRender} = require('./loadQuery');
import {useEffect, useRef} from 'react';
const useLazyLoadQueryNode = require('./useLazyLoadQueryNode');
const useMemoOperationDescriptor = require('./useMemoOperationDescriptor');
const useRelayEnvironment = require('./useRelayEnvironment');
const {
  __internal: {fetchQuery},
} = require('relay-runtime');

// This separate type export is only needed as long as we are injecting
// a separate hooks implementation in ./HooksImplementation -- it can
// be removed after we stop doing that.
export type UseLazyLoadQueryHookType = hook <TVariables: Variables, TData>(
  gqlQuery: Query<TVariables, TData>,
  variables: TVariables,
  options?: {
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
    UNSTABLE_renderPolicy?: RenderPolicy,
  },
) => TData;

hook useLazyLoadQuery<TVariables: Variables, TData>(
  gqlQuery: Query<TVariables, TData>,
  variables: TVariables,
  options?: {
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
    UNSTABLE_renderPolicy?: RenderPolicy
  },
): TData {
  // We need to use this hook in order to be able to track if
  // loadQuery was called during render
  const loadQueryCleanup = useTrackLoadQueryInRender();

  const environment = useRelayEnvironment();

  const query = useMemoOperationDescriptor(
    gqlQuery,
    variables,
    options && options.networkCacheConfig
      ? options.networkCacheConfig
      : {force: true},
  );

  // Ref to store the `fetchObservable` subscription and a ref for thhe subscription object
  const fetchObservable = useRef(fetchQuery(environment, query));
  const subscription = useRef(null);

  // Storing the subscription inside the useEffect hook directly
  useEffect(() => {
    subscription.current = fetchObservable.current.subscribe({});
    return () => {
      loadQueryCleanup();
      // Unsubscribe from the subscription in the cleanup function 
      subscription.current.unsubscribe();
    };
  }, [query, environment]);


  const data = useLazyLoadQueryNode<$FlowFixMe>({
    componentDisplayName: 'useLazyLoadQuery()',
    fetchKey: options?.fetchKey,
    fetchObservable: fetchObservable.current,
    fetchPolicy: options?.fetchPolicy,
    query,
    renderPolicy: options?.UNSTABLE_renderPolicy,
  });
  return data;
}

// $FlowFixMe[react-rule-hook-incompatible]
module.exports = (useLazyLoadQuery: UseLazyLoadQueryHookType);
