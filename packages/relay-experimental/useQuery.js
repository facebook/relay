/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const useMemoOperationDescriptor = require('./useMemoOperationDescriptor');
const useQueryNode = require('./useQueryNode');

import type {FetchPolicy} from './QueryResource';
import type {
  CacheConfig,
  GraphQLTaggedNode,
  OperationType,
} from 'relay-runtime';

function useQuery<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  variables: $ElementType<TQuery, 'variables'>,
  options?: {|
    fetchKey?: string | number,
    fetchPolicy?: FetchPolicy,
    networkCacheConfig?: CacheConfig,
  |},
): $ElementType<TQuery, 'response'> {
  const query = useMemoOperationDescriptor(gqlQuery, variables);
  const data = useQueryNode({
    query,
    fetchKey: options?.fetchKey,
    fetchPolicy: options?.fetchPolicy,
    componentDisplayName: 'useQuery()',
  });
  return data;
}

module.exports = useQuery;
