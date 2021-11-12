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
  FetchPolicy,
  GraphQLResponse,
  Observable,
  OperationDescriptor,
  OperationType,
  RenderPolicy,
} from 'relay-runtime';

const ProfilerContext = require('./ProfilerContext');
const {
  getQueryCacheIdentifier,
  getQueryResourceForEnvironment,
} = require('./QueryResource');
const useFetchTrackingRef = require('./useFetchTrackingRef');
const useFragmentNode = require('./useFragmentNode');
const useRelayEnvironment = require('./useRelayEnvironment');
const React = require('react');

const {useContext, useEffect, useState, useRef} = React;

function useLazyLoadQueryNode<TQuery: OperationType>({
  query,
  componentDisplayName,
  fetchObservable,
  fetchPolicy,
  fetchKey,
  renderPolicy,
}: {|
  query: OperationDescriptor,
  componentDisplayName: string,
  fetchObservable: Observable<GraphQLResponse>,
  fetchPolicy?: ?FetchPolicy,
  fetchKey?: ?string | ?number,
  renderPolicy?: ?RenderPolicy,
|}): TQuery['response'] {
  const environment = useRelayEnvironment();
  const profilerContext = useContext(ProfilerContext);
  const QueryResource = getQueryResourceForEnvironment(environment);

  const [forceUpdateKey, forceUpdate] = useState(0);
  const {startFetch, completeFetch} = useFetchTrackingRef();
  const cacheBreaker = `${forceUpdateKey}-${fetchKey ?? ''}`;
  const cacheIdentifier = getQueryCacheIdentifier(
    environment,
    query,
    fetchPolicy,
    renderPolicy,
    cacheBreaker,
  );

  const preparedQueryResult = profilerContext.wrapPrepareQueryResource(() => {
    return QueryResource.prepareWithIdentifier(
      cacheIdentifier,
      query,
      fetchObservable,
      fetchPolicy,
      renderPolicy,
      {start: startFetch, complete: completeFetch, error: completeFetch},
      profilerContext,
    );
  });

  const maybeHiddenOrFastRefresh = useRef(false);
  useEffect(() => {
    return () => {
      // Attempt to detect if the component was
      // hidden (by Offscreen API), or fast refresh occured;
      // Only in these situations would the effect cleanup
      // for "unmounting" run multiple times, so if
      // we are ever able to read this ref with a value
      // of true, it means that one of these cases
      // has happened.
      maybeHiddenOrFastRefresh.current = true;
    };
  }, []);

  useEffect(() => {
    if (maybeHiddenOrFastRefresh.current === true) {
      // This block only runs if the component has previously "unmounted"
      // due to it being hidden by the Offscreen API, or during fast refresh.
      // At this point, the current cached resource will have been disposed
      // by the previous cleanup, so instead of attempting to
      // do our regular commit setup, which would incorrectly attempt to
      // retain a cached query resource that was disposed, we need to force
      // a re-render so that the cache entry for this query is re-intiliazed and
      // and re-evaluated (and potentially cause a refetch).
      maybeHiddenOrFastRefresh.current = false;
      forceUpdate(n => n + 1);
      return;
    }

    const disposable = QueryResource.retain(
      preparedQueryResult,
      profilerContext,
    );
    return () => {
      disposable.dispose();
    };
    // NOTE: We disable react-hooks-deps warning because the `environment`
    // and `cacheIdentifier` identities are capturing all information about whether
    // the effect should be re-executed and the query re-retained.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environment, cacheIdentifier]);

  useEffect(() => {
    // Release any temporary retain that's not released. At this point, if the
    // cacheIdentifier doesn't change, the query is still permanently retained,
    // and the temporary retain is redundant.
    QueryResource.releaseTemporaryRetain(preparedQueryResult);
    // This effect is intended to run on every commit, thus no dependency
  });

  const {fragmentNode, fragmentRef} = preparedQueryResult;
  const {data} = useFragmentNode(
    fragmentNode,
    fragmentRef,
    componentDisplayName,
  );
  return data;
}

module.exports = useLazyLoadQueryNode;
