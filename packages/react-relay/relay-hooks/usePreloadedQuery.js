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

// flowlint ambiguous-object-type:error

'use strict';

import type {PreloadedQuery} from './EntryPointTypes.flow';
import type {
  GraphQLTaggedNode,
  OperationType,
  RenderPolicy,
} from 'relay-runtime';

const HooksImplementation = require('./HooksImplementation');
const {useTrackLoadQueryInRender} = require('./loadQuery');
const useLazyLoadQueryNode = require('./useLazyLoadQueryNode');
const useMemoOperationDescriptor = require('./useMemoOperationDescriptor');
const useRelayEnvironment = require('./useRelayEnvironment');
const invariant = require('invariant');
const {useDebugValue} = require('react');
const {
  __internal: {fetchQueryDeduped, fetchQuery},
} = require('relay-runtime');
const warning = require('warning');

// This separate type export is only needed as long as we are injecting
// a separate hooks implementation in ./HooksImplementation -- it can
// be removed after we stop doing that.
export type UsePreloadedQueryHookType = <TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  preloadedQuery: PreloadedQuery<TQuery>,
  options?: {|
    UNSTABLE_renderPolicy?: RenderPolicy,
  |},
) => TQuery['response'];

function usePreloadedQuery_LEGACY<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  preloadedQuery: PreloadedQuery<TQuery>,
  options?: {|
    UNSTABLE_renderPolicy?: RenderPolicy,
  |},
): TQuery['response'] {
  // We need to use this hook in order to be able to track if
  // loadQuery was called during render
  useTrackLoadQueryInRender();

  const environment = useRelayEnvironment();
  const {fetchKey, fetchPolicy, source, variables, networkCacheConfig} =
    preloadedQuery;
  const operation = useMemoOperationDescriptor(
    gqlQuery,
    variables,
    networkCacheConfig,
  );

  let useLazyLoadQueryNodeParams;
  if (preloadedQuery.kind === 'PreloadedQuery_DEPRECATED') {
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
    warning(
      preloadedQuery.isDisposed === false,
      'usePreloadedQuery(): Expected preloadedQuery to not be disposed yet. ' +
        'This is because disposing the query marks it for future garbage ' +
        'collection, and as such query results may no longer be present in the Relay ' +
        'store. In the future, this will become a hard error.',
    );

    const fallbackFetchObservable = fetchQuery(environment, operation);
    let fetchObservable;
    if (source != null && environment === preloadedQuery.environment) {
      // If the source observable exists and the environments match, reuse
      // the source observable.
      // If the source observable happens to be empty, we need to fall back
      // and re-execute and de-dupe the query (at render time).
      fetchObservable = source.ifEmpty(fallbackFetchObservable);
    } else if (environment !== preloadedQuery.environment) {
      // If a call to loadQuery is made with a particular environment, and that
      // preloaded query is passed to usePreloadedQuery in a different environment
      // context, we cannot re-use the existing preloaded query.
      // Instead, we need to fall back and re-execute and de-dupe the query with
      // the new environment (at render time).
      // TODO T68036756 track occurences of this warning and turn it into a hard error
      warning(
        false,
        'usePreloadedQuery(): usePreloadedQuery was passed a preloaded query ' +
          'that was created with a different environment than the one that is currently ' +
          'in context. In the future, this will become a hard error.',
      );
      fetchObservable = fallbackFetchObservable;
    } else {
      // if (source == null)
      // If the source observable does not exist, we need to
      // fall back and re-execute and de-dupe the query (at render time).
      fetchObservable = fallbackFetchObservable;
    }

    useLazyLoadQueryNodeParams = {
      componentDisplayName: 'usePreloadedQuery()',
      fetchObservable,
      fetchKey,
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
      fetchKey,
      fetchPolicy,
      renderPolicy: options?.UNSTABLE_renderPolicy,
    });
  }
  return data;
}

function usePreloadedQuery<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  preloadedQuery: PreloadedQuery<TQuery>,
  options?: {|
    UNSTABLE_renderPolicy?: RenderPolicy,
  |},
): TQuery['response'] {
  const impl = HooksImplementation.get();
  if (impl) {
    return impl.usePreloadedQuery(gqlQuery, preloadedQuery, options);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePreloadedQuery_LEGACY(gqlQuery, preloadedQuery, options);
  }
}

module.exports = (usePreloadedQuery: UsePreloadedQueryHookType);
