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

import type {LoadMoreFn, UseLoadMoreFunctionArgs} from '../useLoadMoreFunction';
import type {ReturnType} from '../usePaginationFragment';
import type {Options} from './useRefetchableFragmentInternal_EXPERIMENTAL';
import type {
  FragmentType,
  GraphQLResponse,
  Observer,
  RefetchableFragment,
  Variables,
} from 'relay-runtime';

const useLoadMoreFunction = require('../useLoadMoreFunction');
const useRelayEnvironment = require('../useRelayEnvironment');
const useStaticFragmentNodeWarning = require('../useStaticFragmentNodeWarning');
const useRefetchableFragmentInternal = require('./useRefetchableFragmentInternal_EXPERIMENTAL');
const {useCallback, useDebugValue, useState} = require('react');
const {
  getFragment,
  getFragmentIdentifier,
  getPaginationMetadata,
} = require('relay-runtime');

function usePaginationFragment<
  TFragmentType: FragmentType,
  TVariables: Variables,
  TData,
  TKey: ?{+$fragmentSpreads: TFragmentType, ...},
>(
  fragmentInput: RefetchableFragment<TFragmentType, TData, TVariables>,
  parentFragmentRef: TKey,
): ReturnType<TVariables, TData, TKey> {
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(
    fragmentNode,
    'first argument of usePaginationFragment()',
  );
  const componentDisplayName = 'usePaginationFragment()';

  const {connectionPathInFragmentData, paginationRequest, paginationMetadata} =
    getPaginationMetadata(fragmentNode, componentDisplayName);

  const {fragmentData, fragmentRef, refetch} = useRefetchableFragmentInternal<
    {variables: TVariables, response: TData},
    {data?: TData},
  >(fragmentNode, parentFragmentRef, componentDisplayName);
  const fragmentIdentifier = getFragmentIdentifier(fragmentNode, fragmentRef);

  // Backward pagination
  const [loadPrevious, hasPrevious, isLoadingPrevious, disposeFetchPrevious] =
    useLoadMore<TVariables>({
      componentDisplayName,
      connectionPathInFragmentData,
      direction: 'backward',
      fragmentData,
      fragmentIdentifier,
      fragmentNode,
      fragmentRef,
      paginationMetadata,
      paginationRequest,
    });

  // Forward pagination
  const [loadNext, hasNext, isLoadingNext, disposeFetchNext] =
    useLoadMore<TVariables>({
      componentDisplayName,
      connectionPathInFragmentData,
      direction: 'forward',
      fragmentData,
      fragmentIdentifier,
      fragmentNode,
      fragmentRef,
      paginationMetadata,
      paginationRequest,
    });

  const refetchPagination = useCallback(
    (variables: TVariables, options: void | Options) => {
      disposeFetchNext();
      disposeFetchPrevious();
      return refetch(variables, {...options, __environment: undefined});
    },
    [disposeFetchNext, disposeFetchPrevious, refetch],
  );

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDebugValue({
      fragment: fragmentNode.name,
      data: fragmentData,
      hasNext,
      isLoadingNext,
      hasPrevious,
      isLoadingPrevious,
    });
  }
  return {
    // $FlowFixMe[incompatible-return]
    data: fragmentData,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious,
    refetch: refetchPagination,
  };
}

function useLoadMore<TVariables: Variables>(
  args: $Diff<
    UseLoadMoreFunctionArgs,
    {
      observer: Observer<GraphQLResponse>,
      onReset: () => void,
      ...
    },
  >,
): [LoadMoreFn<TVariables>, boolean, boolean, () => void] {
  const environment = useRelayEnvironment();
  const [isLoadingMore, reallySetIsLoadingMore] = useState(false);
  // Schedule this update since it must be observed by components at the same
  // batch as when hasNext changes. hasNext is read from the store and store
  // updates are scheduled, so this must be scheduled too.
  const setIsLoadingMore = (value: boolean) => {
    const schedule = environment.getScheduler()?.schedule;
    if (schedule) {
      schedule(() => {
        reallySetIsLoadingMore(value);
      });
    } else {
      reallySetIsLoadingMore(value);
    }
  };
  const observer = {
    start: () => setIsLoadingMore(true),
    complete: () => setIsLoadingMore(false),
    error: () => setIsLoadingMore(false),
  };
  const handleReset = () => setIsLoadingMore(false);
  const [loadMore, hasMore, disposeFetch] = useLoadMoreFunction<TVariables>({
    ...args,
    observer,
    onReset: handleReset,
  });
  return [loadMore, hasMore, isLoadingMore, disposeFetch];
}

module.exports = usePaginationFragment;
