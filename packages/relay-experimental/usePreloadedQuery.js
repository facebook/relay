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
const warning = require('warning');

const {useTrackLoadQueryInRender} = require('./loadQuery');
const {useDebugValue} = require('react');
const {
  __internal: {fetchQueryDeduped},
  Observable,
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
  const {fetchPolicy, source, variables} = preloadedQuery;
  const operation = useMemoOperationDescriptor(gqlQuery, variables);

  let useLazyLoadQueryNodeParams;
  if (preloadedQuery.kind === 'PreloadedQuery_DEPRECATED') {
    const {fetchKey} = preloadedQuery;
    invariant(
      operation.request.node.params.name === preloadedQuery.name,
      'usePreloadedQuery(): Expected data to be prefetched for query `%s`, ' +
        'got prefetch results for query `%s`.',
      operation.request.node.params.name,
      preloadedQuery.name,
    );

    useLazyLoadQueryNodeParams = {
      componentDisplayName: 'usePreloadedQuery()',
      fetchKey,
      fetchObservable: fetchQueryDeduped(
        environment,
        operation.request.identifier,
        () => {
          if (environment === preloadedQuery.environment && source != null) {
            return environment.executeWithSource({operation, source});
          } else {
            return environment.execute({operation});
          }
        },
      ),
      fetchPolicy,
      query: operation,
      renderPolicy: options?.UNSTABLE_renderPolicy,
    };
  } else {
    // Here, we are calling fetchQueryDeduped, which usually ensures that only
    // a single network request is active for a given (environment, identifier) pair.
    // If no network request is active, it will call the third argument and initiate
    // a network request.
    //
    // However, if preloadedQuery.kind === 'PreloadedQuery', the network request (if
    // it exists) has already been made.
    //
    // Thus, if two calls to loadQuery are made with the same environment and identifier
    // (i.e. the same request is made twice), the second query will be deduped
    // and components will suspend for the duration of the first query.
    const dedupedSource = fetchQueryDeduped(
      environment,
      operation.request.identifier,
      () => {
        if (source && environment === preloadedQuery.environment) {
          return source.ifEmpty(
            Observable.create(sink => {
              return environment.execute({operation}).subscribe(sink);
            }),
          );
        } else {
          // if a call to loadQuery is made with a particular environment, and that
          // preloaded query is passed to usePreloadedQuery in a different environmental
          // context, we cannot re-use the existing preloaded query. Instead, we must
          // re-execute the query with the new environment (at render time.)
          // TODO T68036756 track occurences of this warning and turn it into a hard error
          warning(
            false,
            'usePreloadedQuery(): usePreloadedQuery was passed a preloaded query ' +
              'that was created with a different environment than the one that is currently ' +
              'in context. In the future, this will become a hard error.',
          );
          return environment.execute({operation});
        }
      },
    );

    useLazyLoadQueryNodeParams = {
      componentDisplayName: 'usePreloadedQuery()',
      fetchObservable: dedupedSource,
      fetchPolicy,
      query: operation,
      renderPolicy: options?.UNSTABLE_renderPolicy,
    };
  }

  const data = useLazyLoadQueryNode(useLazyLoadQueryNodeParams);
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue({
      query: preloadedQuery.name,
      variables: preloadedQuery.variables,
      data,
      fetchKey:
        preloadedQuery.kind === 'PreloadedQuery_DEPRECATED'
          ? preloadedQuery.fetchKey
          : undefined,
      fetchPolicy,
      renderPolicy: options?.UNSTABLE_renderPolicy,
    });
  }
  return data;
}

module.exports = usePreloadedQuery;
