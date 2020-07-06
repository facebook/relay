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

const useLazyLoadQueryNode = require('./useLazyLoadQueryNode');
const useMemoOperationDescriptor = require('./useMemoOperationDescriptor');

const {useTrackLoadQueryInRender} = require('./loadQuery');

import type {
  CacheConfig,
  FetchPolicy,
  GraphQLTaggedNode,
  OperationType,
  RenderPolicy,
  VariablesOf,
} from 'relay-runtime';

function useLazyLoadQuery<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: VariablesOf<TQuery>,
  options?: {|
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
    UNSTABLE_renderPolicy?: RenderPolicy,
  |},
): $ElementType<TQuery, 'response'> {
  // We need to use this hook in order to be able to track if
  // loadQuery was called during render
  useTrackLoadQueryInRender();

  const query = useMemoOperationDescriptor(gqlQuery, variables);
  const data = useLazyLoadQueryNode({
    componentDisplayName: 'useLazyLoadQuery()',
    fetchKey: options?.fetchKey,
    fetchPolicy: options?.fetchPolicy,
    networkCacheConfig: options?.networkCacheConfig,
    query,
    renderPolicy: options?.UNSTABLE_renderPolicy,
  });
  return data;
}

module.exports = useLazyLoadQuery;
