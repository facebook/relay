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

import type {PreloadedQuery} from '../EntryPointTypes.flow';
import type {
  GraphQLTaggedNode,
  OperationType,
  RenderPolicy,
} from 'relay-runtime';

const {useTrackLoadQueryInRender} = require('../loadQuery');
const useMemoOperationDescriptor = require('../useMemoOperationDescriptor');
const useRelayEnvironment = require('../useRelayEnvironment');
const getQueryResultOrFetchQuery = require('./getQueryResultOrFetchQuery_REACT_CACHE');
const useFragmentInternal = require('./useFragmentInternal_REACT_CACHE');
const invariant = require('invariant');
const {useDebugValue, useEffect} = require('react');
const {
  __internal: {fetchQueryDeduped, fetchQuery},
} = require('relay-runtime');
const warning = require('warning');

function usePreloadedQuery_REACT_CACHE<TQuery: OperationType>(
  gqlQuery: GraphQLTaggedNode,
  preloadedQuery: PreloadedQuery<TQuery>,
  options?: {
    UNSTABLE_renderPolicy?: RenderPolicy,
  },
): TQuery['response'] {
  const environment = useRelayEnvironment();

  useTrackLoadQueryInRender();

  const {fetchKey, fetchPolicy, source, variables, networkCacheConfig} =
    preloadedQuery;
  const operation = useMemoOperationDescriptor(
    gqlQuery,
    variables,
    networkCacheConfig,
  );

  let fetchObservable;
  if (preloadedQuery.kind === 'PreloadedQuery_DEPRECATED') {
    invariant(
      operation.request.node.params.name === preloadedQuery.name,
      'usePreloadedQuery(): Expected data to be prefetched for query `%s`, ' +
        'got prefetch results for query `%s`.',
      operation.request.node.params.name,
      preloadedQuery.name,
    );
    fetchObservable = fetchQueryDeduped(
      environment,
      operation.request.identifier,
      () => {
        if (environment === preloadedQuery.environment && source != null) {
          return environment.executeWithSource({operation, source});
        } else {
          return environment.execute({operation});
        }
      },
    );
  } else {
    warning(
      preloadedQuery.isDisposed === false,
      'usePreloadedQuery(): Expected preloadedQuery to not be disposed yet. ' +
        'This is because disposing the query marks it for future garbage ' +
        'collection, and as such query results may no longer be present in the Relay ' +
        'store. In the future, this will become a hard error.',
    );
    const fallbackFetchObservable = fetchQuery(environment, operation);
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
  }

  // Get the query going if needed -- this may suspend.
  const [queryResult, effect] = getQueryResultOrFetchQuery(
    environment,
    operation,
    {
      fetchPolicy,
      renderPolicy: options?.UNSTABLE_renderPolicy,
      fetchKey,
      fetchObservable,
    },
  );

  useEffect(effect);

  // Read the query's root fragment -- this may suspend.
  const {fragmentNode, fragmentRef} = queryResult;
  const data = useFragmentInternal(
    fragmentNode,
    fragmentRef,
    'usePreloadedQuery()',
    {
      fetchPolicy: fetchPolicy,
      networkCacheConfig: networkCacheConfig,
    },
  );

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

module.exports = usePreloadedQuery_REACT_CACHE;
