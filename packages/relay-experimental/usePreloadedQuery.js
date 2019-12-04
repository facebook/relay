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

const invariant = require('invariant');
const useLazyLoadQueryNode = require('./useLazyLoadQueryNode');
const useMemoOperationDescriptor = require('./useMemoOperationDescriptor');
const useRelayEnvironment = require('./useRelayEnvironment');

const {useTrackLoadQueryInRender} = require('./loadQuery');
const {
  __internal: {fetchQueryDeduped},
} = require('relay-runtime');

import type {PreloadedQuery} from './EntryPointTypes.flow';
import type {
  GraphQLTaggedNode,
  OperationType,
  RenderPolicy,
} from 'relay-runtime';

function usePreloadedQuery<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  preloadedQuery: PreloadedQuery<TQuery>,
  options?: {|
    UNSTABLE_renderPolicy?: RenderPolicy,
  |},
): $ElementType<TQuery, 'response'> {
  // We need to use this hook in order to be able to track if
  // loadQuery was called during render
  useTrackLoadQueryInRender();

  const environment = useRelayEnvironment();
  const {fetchPolicy, fetchKey, source, variables} = preloadedQuery;
  const operation = useMemoOperationDescriptor(gqlQuery, variables);
  invariant(
    operation.request.node.params.name === preloadedQuery.name,
    'usePreloadedQuery(): Expected data to be prefetched for query `%s`, ' +
      'got prefetch results for query `%s`.',
    operation.request.node.params.name,
    preloadedQuery.name,
  );

  const data = useLazyLoadQueryNode({
    componentDisplayName: 'usePreloadedQuery()',
    fetchKey,
    fetchObservable: fetchQueryDeduped(environment, operation.request, () => {
      if (environment === preloadedQuery.environment && source != null) {
        return environment.executeWithSource({operation, source});
      } else {
        return environment.execute({operation});
      }
    }),
    fetchPolicy,
    query: operation,
    renderPolicy: options?.UNSTABLE_renderPolicy,
  });
  return data;
}

module.exports = usePreloadedQuery;
