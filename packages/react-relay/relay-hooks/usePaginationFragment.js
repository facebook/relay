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

import type {Options} from './legacy/useRefetchableFragmentNode';
import type {LoadMoreFn, UseLoadMoreFunctionArgs} from './useLoadMoreFunction';
import type {RefetchFn} from './useRefetchableFragment';
import type {
  FragmentType,
  GraphQLResponse,
  Observer,
  RefetchableFragment,
  Variables,
} from 'relay-runtime';

const HooksImplementation = require('./HooksImplementation');
const useRefetchableFragmentNode = require('./legacy/useRefetchableFragmentNode');
const useLoadMoreFunction = require('./useLoadMoreFunction');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
const {useCallback, useDebugValue, useState} = require('react');
const {
  getFragment,
  getFragmentIdentifier,
  getPaginationMetadata,
} = require('relay-runtime');

// This separate type export is only needed as long as we are injecting
// a separate hooks implementation in ./HooksImplementation -- it can
// be removed after we stop doing that.
export type UsePaginationFragmentType = <
  TFragmentType: FragmentType,
  TVariables: Variables,
  TData,
  TKey: ?{+$fragmentSpreads: TFragmentType, ...},
>(
  fragmentInput: RefetchableFragment<TFragmentType, TData, TVariables>,
  parentFragmentRef: TKey,
) => ReturnType<TVariables, TData, TKey>;

function usePaginationFragment_LEGACY<
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

  const {fragmentData, fragmentRef, refetch} = useRefetchableFragmentNode<
    $FlowFixMe,
    $FlowFixMe,
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

  const refetchPagination: RefetchFn<TVariables, TKey> = useCallback(
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
    data: (fragmentData: $FlowFixMe),
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
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

export type ReturnType<TVariables, TData, TKey> = {
  // NOTE: This type ensures that the type of the returned data is either:
  //   - nullable if the provided ref type is nullable
  //   - non-nullable if the provided ref type is non-nullable
  data: [+key: TKey] extends [+key: {+$fragmentSpreads: mixed, ...}]
    ? TData
    : ?TData,
  loadNext: LoadMoreFn<TVariables>,
  loadPrevious: LoadMoreFn<TVariables>,
  hasNext: boolean,
  hasPrevious: boolean,
  isLoadingNext: boolean,
  isLoadingPrevious: boolean,
  refetch: RefetchFn<TVariables, TKey>,
};

function usePaginationFragment<
  TFragmentType: FragmentType,
  TVariables: Variables,
  TData,
  TKey: ?{+$fragmentSpreads: TFragmentType, ...},
>(
  fragmentInput: RefetchableFragment<TFragmentType, TData, TVariables>,
  parentFragmentRef: TKey,
): ReturnType<TVariables, TData, TKey> {
  const impl = HooksImplementation.get();
  if (impl) {
    // $FlowExpectedError[incompatible-return] Flow cannot prove that two conditional type satisfy each other
    return impl.usePaginationFragment<TFragmentType, TVariables, TData, TKey>(
      fragmentInput,
      parentFragmentRef,
    );
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return usePaginationFragment_LEGACY(fragmentInput, parentFragmentRef);
  }
}

module.exports = usePaginationFragment;
