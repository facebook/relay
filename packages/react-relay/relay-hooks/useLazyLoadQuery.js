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
  CacheConfig,
  FetchPolicy,
  GraphQLTaggedNode,
  OperationType,
  RenderPolicy,
  VariablesOf,
} from 'relay-runtime';

const {useTrackLoadQueryInRender} = require('./loadQuery');
const useLazyLoadQueryNode = require('./useLazyLoadQueryNode');
const useMemoOperationDescriptor = require('./useMemoOperationDescriptor');
const useRelayEnvironment = require('./useRelayEnvironment');
const {
  __internal: {fetchQuery},
} = require('relay-runtime');

function useLazyLoadQuery<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: VariablesOf<TQuery>,
  options?: {|
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
    UNSTABLE_renderPolicy?: RenderPolicy,
  |},
): TQuery['response'] {
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

module.exports = useLazyLoadQuery;
