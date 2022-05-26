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
  CacheConfig,
  FetchPolicy,
  Query,
  RenderPolicy,
  Variables,
} from 'relay-runtime';

const {useTrackLoadQueryInRender} = require('../loadQuery');
const useMemoOperationDescriptor = require('../useMemoOperationDescriptor');
const useRelayEnvironment = require('../useRelayEnvironment');
const getQueryResultOrFetchQuery = require('./getQueryResultOrFetchQuery_REACT_CACHE');
const useFragmentInternal = require('./useFragmentInternal_REACT_CACHE');
const {useEffect} = require('react');

function useLazyLoadQuery_REACT_CACHE<TVariables: Variables, TData>(
  gqlQuery: Query<TVariables, TData>,
  variables: TVariables,
  options?: {|
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
    UNSTABLE_renderPolicy?: RenderPolicy,
  |},
): TData {
  useTrackLoadQueryInRender();
  const environment = useRelayEnvironment();

  const queryOperationDescriptor = useMemoOperationDescriptor(
    gqlQuery,
    variables,
    options?.networkCacheConfig ?? {force: true},
  );

  // Get the query going if needed -- this may suspend.
  const [queryResult, effect] = getQueryResultOrFetchQuery(
    environment,
    queryOperationDescriptor,
    {
      fetchPolicy: options?.fetchPolicy,
      renderPolicy: options?.UNSTABLE_renderPolicy,
      fetchKey: options?.fetchKey,
    },
  );

  useEffect(effect);

  // Read the query's root fragment -- this may suspend.
  const {fragmentNode, fragmentRef} = queryResult;
  // $FlowExpectedError[incompatible-return] Is this a fixable incompatible-return?
  return useFragmentInternal(fragmentNode, fragmentRef, 'useLazyLoadQuery()', {
    fetchPolicy: options?.fetchPolicy,
    networkCacheConfig: options?.networkCacheConfig,
  });
}

module.exports = useLazyLoadQuery_REACT_CACHE;
