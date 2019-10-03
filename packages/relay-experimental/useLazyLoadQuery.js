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

const useLazyLoadQueryNode = require('./useLazyLoadQueryNode');
const useMemoOperationDescriptor = require('./useMemoOperationDescriptor');

import type {FetchPolicy} from './QueryResource';
import type {
  CacheConfig,
  GraphQLTaggedNode,
  OperationType,
} from 'relay-runtime';

function useLazyLoadQuery<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: $ElementType<TQuery, 'variables'>,
  options?: {|
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
  |},
): $ElementType<TQuery, 'response'> {
  const query = useMemoOperationDescriptor(gqlQuery, variables);
  const data = useLazyLoadQueryNode({
    componentDisplayName: 'useLazyLoadQuery()',
    fetchKey: options?.fetchKey,
    fetchPolicy: options?.fetchPolicy,
    networkCacheConfig: options?.networkCacheConfig,
    query,
  });
  return data;
}

module.exports = useLazyLoadQuery;
