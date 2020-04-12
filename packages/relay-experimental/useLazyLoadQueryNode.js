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

const ProfilerContext = require('./ProfilerContext');
const React = require('react');

const useFetchTrackingRef = require('./useFetchTrackingRef');
const useFragmentNode = require('./useFragmentNode');
const useRelayEnvironment = require('./useRelayEnvironment');

const {getQueryResourceForEnvironment} = require('./QueryResource');
const {
  __internal: {fetchQuery},
} = require('relay-runtime');

import type {
  CacheConfig,
  FetchPolicy,
  GraphQLResponse,
  Observable,
  OperationDescriptor,
  OperationType,
  RenderPolicy,
} from 'relay-runtime';

const {useContext, useEffect, useState, useRef} = React;

function useLazyLoadQueryNode<TQuery: OperationType>(args: {|
  query: OperationDescriptor,
  componentDisplayName: string,
  fetchObservable?: Observable<GraphQLResponse>,
  fetchPolicy?: ?FetchPolicy,
  fetchKey?: ?string | ?number,
  networkCacheConfig?: CacheConfig,
  renderPolicy?: ?RenderPolicy,
|}): $ElementType<TQuery, 'response'> {
  const environment = useRelayEnvironment();
  const profilerContext = useContext(ProfilerContext);
  const QueryResource = getQueryResourceForEnvironment(environment);

  const {
    query,
    componentDisplayName,
    fetchKey,
    fetchPolicy,
    renderPolicy,
  } = args;
  const fetchObservable =
    args.fetchObservable ??
    fetchQuery(environment, query, {
      networkCacheConfig: args.networkCacheConfig ?? {force: true},
    });
  const {startFetch, completeFetch} = useFetchTrackingRef();

  const preparedQueryResult = profilerContext.wrapPrepareQueryResource(() => {
    return QueryResource.prepare(
      query,
      fetchObservable,
      fetchPolicy,
      renderPolicy,
      {start: startFetch, complete: completeFetch, error: completeFetch},
      fetchKey,
      profilerContext,
    );
  });

  let _forceUpdate;
  let _maybeFastRefresh;
  if (__DEV__) {
    /* eslint-disable react-hooks/rules-of-hooks */
    [, _forceUpdate] = useState(0);
    _maybeFastRefresh = useRef(false);
    useEffect(() => {
      return () => {
        // Detect fast refresh, only runs multiple times in fast refresh
        _maybeFastRefresh.current = true;
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    /* eslint-enable react-hooks/rules-of-hooks */
  }

  useEffect(() => {
    if (__DEV__) {
      if (_maybeFastRefresh && _maybeFastRefresh.current) {
        /**
         * This block only runs during fast refresh, the current resource and
         * it's cache is disposed in the previous cleanup. Stop retaining and
         * force a re-render to restart fetchObservable and retain correctly.
         */
        _maybeFastRefresh.current = false;
        _forceUpdate && _forceUpdate(n => n + 1);
        return;
      }
    }
    const disposable = QueryResource.retain(
      preparedQueryResult,
      profilerContext,
    );
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

module.exports = useLazyLoadQueryNode;
