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

const getPaginationMetadata = require('./getPaginationMetadata');
const useLoadMoreFunction = require('./useLoadMoreFunction');
const useRefetchableFragmentNode = require('./useRefetchableFragmentNode');
const useStaticFragmentNodeWarning = require('./useStaticFragmentNodeWarning');

const {useCallback, useState} = require('react');
const {getFragment, getFragmentIdentifier} = require('relay-runtime');

import type {LoadMoreFn, UseLoadMoreFunctionArgs} from './useLoadMoreFunction';
import type {RefetchFnDynamic} from './useRefetchableFragmentNode';
import type {
  GraphQLResponse,
  GraphQLTaggedNode,
  Observer,
  OperationType,
} from 'relay-runtime';

export type ReturnType<TQuery: OperationType, TKey, TFragmentData> = {|
  data: TFragmentData,
  loadNext: LoadMoreFn,
  loadPrevious: LoadMoreFn,
  hasNext: boolean,
  hasPrevious: boolean,
  isLoadingNext: boolean,
  isLoadingPrevious: boolean,
  refetch: RefetchFnDynamic<TQuery, TKey>,
|};

function useLegacyPaginationFragment<
  TQuery: OperationType,
  TKey: ?{+$data?: mixed},
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
    & (<TFragmentData>( {+$data?: TFragmentData}) =>  TFragmentData)
    & (<TFragmentData>(?{+$data?: TFragmentData}) => ?TFragmentData),
    TKey,
  >,
> {
  const fragmentNode = getFragment(fragmentInput);
  useStaticFragmentNodeWarning(
    fragmentNode,
    'first argument of useLegacyPaginationFragment()',
  );
  const componentDisplayName = 'useLegacyPaginationFragment()';

  const {
    connectionPathInFragmentData,
    fragmentRefPathInResponse,
    paginationRequest,
    paginationMetadata,
  } = getPaginationMetadata(fragmentNode, componentDisplayName);

  const {fragmentData, fragmentRef, refetch} = useRefetchableFragmentNode<
    TQuery,
    TKey,
  >(fragmentNode, parentFragmentRef, componentDisplayName);
  const fragmentIdentifier = getFragmentIdentifier(fragmentNode, fragmentRef);

  // Backward pagination
  const [
    loadPrevious,
    hasPrevious,
    isLoadingPrevious,
    disposeFetchPrevious,
  ] = useLoadMore({
    direction: 'backward',
    fragmentNode,
    fragmentRef,
    fragmentIdentifier,
    fragmentData,
    connectionPathInFragmentData,
    fragmentRefPathInResponse,
    paginationRequest,
    paginationMetadata,
    componentDisplayName,
  });

  // Forward pagination
  const [loadNext, hasNext, isLoadingNext, disposeFetchNext] = useLoadMore({
    direction: 'forward',
    fragmentNode,
    fragmentRef,
    fragmentIdentifier,
    fragmentData,
    connectionPathInFragmentData,
    fragmentRefPathInResponse,
    paginationRequest,
    paginationMetadata,
    componentDisplayName,
  });

  const refetchPagination: RefetchFnDynamic<TQuery, TKey> = useCallback(
    (variables, options) => {
      disposeFetchNext();
      disposeFetchPrevious();
      return refetch(variables, {...options, __environment: undefined});
    },
    [disposeFetchNext, disposeFetchPrevious, refetch],
  );

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

function useLoadMore(
  args: $Diff<
    UseLoadMoreFunctionArgs,
    {observer: Observer<GraphQLResponse>, onReset: () => void},
  >,
): [LoadMoreFn, boolean, boolean, () => void] {
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

module.exports = useLegacyPaginationFragment;
