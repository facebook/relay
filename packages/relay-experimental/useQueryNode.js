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

const ProfilerContext = require('./ProfilerContext');
const React = require('react');

const useFetchTrackingRef = require('./useFetchTrackingRef');
const useFragmentNode = require('./useFragmentNode');
const useRelayEnvironment = require('./useRelayEnvironment');

const {getQueryResourceForEnvironment} = require('./QueryResource');
const {
  __internal: {fetchQuery},
} = require('relay-runtime');

import type {FetchPolicy} from './QueryResource';
import type {
  CacheConfig,
  GraphQLResponse,
  Observable,
  OperationDescriptor,
  OperationType,
} from 'relay-runtime';

const {useContext, useEffect} = React;

function useQueryNode<TQuery: OperationType>(args: {|
  query: OperationDescriptor,
  componentDisplayName: string,
  fetchObservable?: Observable<GraphQLResponse>,
  fetchPolicy?: ?FetchPolicy,
  fetchKey?: ?string | ?number,
  networkCacheConfig?: CacheConfig,
|}): $ElementType<TQuery, 'response'> {
  const environment = useRelayEnvironment();
  const profilerContext = useContext(ProfilerContext);
  const QueryResource = getQueryResourceForEnvironment(environment);

  const {query, componentDisplayName, fetchKey, fetchPolicy} = args;
  const fetchObservable =
    args.fetchObservable ??
    fetchQuery(environment, query, {
      networkCacheConfig: args.networkCacheConfig,
    });
  const {startFetch, completeFetch} = useFetchTrackingRef();

  const preparedQueryResult = profilerContext.wrapPrepareQueryResource(() => {
    return QueryResource.prepare(
      query,
      fetchObservable,
      fetchPolicy,
      null,
      {start: startFetch, complete: completeFetch, error: completeFetch},
      fetchKey,
    );
  });

  useEffect(() => {
    const disposable = QueryResource.retain(preparedQueryResult);
    return () => {
      disposable.dispose();
    };
    // NOTE: We disable react-hooks-deps warning because the `environment`
    // and `query` identities are capturing all information about whether
    // the effect should be re-ran and the query re-retained.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, query]);

  const {fragmentNode, fragmentRef} = preparedQueryResult;
  const {data} = useFragmentNode(
    fragmentNode,
    fragmentRef,
    componentDisplayName,
  );
  return data;
}

module.exports = useQueryNode;
