/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
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
const useLazyLoadQueryNode = require('./useLazyLoadQueryNode');
const useMemoOperationDescriptor = require('./useMemoOperationDescriptor');
const useRelayEnvironment = require('./useRelayEnvironment');
const {
  __internal: {fetchQuery},
} = require('relay-runtime');

// This separate type export is only needed as long as we are injecting
// a separate hooks implementation in ./HooksImplementation -- it can
// be removed after we stop doing that.
export type UseLazyLoadQueryHookType = <TVariables: Variables, TData>(
  gqlQuery: Query<TVariables, TData>,
  variables: TVariables,
  options?: {
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
    UNSTABLE_renderPolicy?: RenderPolicy,
  },
) => TData;

function useLazyLoadQuery<TVariables: Variables, TData>(
  gqlQuery: Query<TVariables, TData>,
  variables: TVariables,
  options?: {
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
    UNSTABLE_renderPolicy?: RenderPolicy,
  },
): TData {
  // We need to use this hook in order to be able to track if
  // loadQuery was called during render
  useTrackLoadQueryInRender();

  const environment = useRelayEnvironment();

  const query = useMemoOperationDescriptor(
    gqlQuery,
    variables,
    options && options.networkCacheConfig
      ? options.networkCacheConfig
      : {force: true},
  );
  const data = useLazyLoadQueryNode({
    componentDisplayName: 'useLazyLoadQuery()',
    fetchKey: options?.fetchKey,
    fetchObservable: fetchQuery(environment, query),
    fetchPolicy: options?.fetchPolicy,
    query,
    renderPolicy: options?.UNSTABLE_renderPolicy,
  });
  return data;
}

module.exports = (useLazyLoadQuery: UseLazyLoadQueryHookType);
