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

import type {LoadMoreFn, UseLoadMoreFunctionArgs} from './useLoadMoreFunction';
import type {RefetchFnDynamic} from './useRefetchableFragmentNode';
import type {
  FragmentType,
  GraphQLResponse,
  GraphQLTaggedNode,
  Observer,
  OperationType,
} from 'relay-runtime';

const useLoadMoreFunction = require('./useLoadMoreFunction');
const useRefetchableFragmentNode = require('./useRefetchableFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');
const {useCallback, useDebugValue, useState} = require('react');
const {
  getFragment,
  getFragmentIdentifier,
  getPaginationMetadata,
} = require('relay-runtime');

export type ReturnType<TQuery: OperationType, TKey, TFragmentData> = {|
  data: TFragmentData,
  loadNext: LoadMoreFn<TQuery>,
  loadPrevious: LoadMoreFn<TQuery>,
  hasNext: boolean,
  hasPrevious: boolean,
  isLoadingNext: boolean,
  isLoadingPrevious: boolean,
  refetch: RefetchFnDynamic<TQuery, TKey>,
|};

function usePaginationFragment<
  TQuery: OperationType,
  TKey: ?{+$data?: mixed, +$fragmentSpreads: FragmentType, ...},
>(
  fragmentInput: GraphQLTaggedNode,
  parentFragmentRef: TKey,
): ReturnType<
  TQuery,
  TKey,
  // NOTE: This $Call ensures that the type of the returned data is either:
  //   - nullable if the provided ref type is nullable
  //   - non-nullable if the provided ref type is non-nullable
  // prettier-ignore
  $Call<
    & (<TFragmentData>( { +$data?: TFragmentData, ... }) =>  TFragmentData)
    & (<TFragmentData>(?{ +$data?: TFragmentData, ... }) => ?TFragmentData),
    TKey,
  >,
> {
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(
    fragmentNode,
    'first argument of usePaginationFragment()',
  );
  const componentDisplayName = 'usePaginationFragment()';

  const {
    connectionPathInFragmentData,
    paginationRequest,
    paginationMetadata,
    identifierField,
  } = getPaginationMetadata(fragmentNode, componentDisplayName);

  const {fragmentData, fragmentRef, refetch} = useRefetchableFragmentNode<
    TQuery,
    TKey,
  >(fragmentNode, parentFragmentRef, componentDisplayName);
  const fragmentIdentifier = getFragmentIdentifier(fragmentNode, fragmentRef);

  // Backward pagination
  const [loadPrevious, hasPrevious, isLoadingPrevious, disposeFetchPrevious] =
    useLoadMore<TQuery>({
      componentDisplayName,
      connectionPathInFragmentData,
      direction: 'backward',
      fragmentData,
      fragmentIdentifier,
      fragmentNode,
      fragmentRef,
      identifierField,
      paginationMetadata,
      paginationRequest,
    });

  // Forward pagination
  const [loadNext, hasNext, isLoadingNext, disposeFetchNext] =
    useLoadMore<TQuery>({
      componentDisplayName,
      connectionPathInFragmentData,
      direction: 'forward',
      fragmentData,
      fragmentIdentifier,
      fragmentNode,
      fragmentRef,
      identifierField,
      paginationMetadata,
      paginationRequest,
    });

  const refetchPagination: RefetchFnDynamic<TQuery, TKey> = useCallback(
    (variables, options) => {
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

function useLoadMore<TQuery: OperationType>(
  args: $Diff<
    UseLoadMoreFunctionArgs,
    {
      observer: Observer<GraphQLResponse>,
      onReset: () => void,
      ...
    },
  >,
): [LoadMoreFn<TQuery>, boolean, boolean, () => void] {
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observer = {
    start: () => setIsLoadingMore(true),
    complete: () => setIsLoadingMore(false),
    error: () => setIsLoadingMore(false),
  };
  const handleReset = () => setIsLoadingMore(false);
  const [loadMore, hasMore, disposeFetch] = useLoadMoreFunction({
    ...args,
    observer,
    onReset: handleReset,
  });
  return [loadMore, hasMore, isLoadingMore, disposeFetch];
}

module.exports = usePaginationFragment;
