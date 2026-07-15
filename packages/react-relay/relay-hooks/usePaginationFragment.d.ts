/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {KeyType, KeyTypeData, RefetchFnDynamic} from '../ReactRelayTypes';
import { LoadMoreFn } from './useLoadMoreFunction';
import {GraphQLTaggedNode, OperationType} from 'relay-runtime';

export interface usePaginationFragmentHookType<
    TQuery extends OperationType,
    TKey extends KeyType | null | undefined,
    TFragmentData,
> {
    data: TFragmentData;
    loadNext: LoadMoreFn<TQuery>;
    loadPrevious: LoadMoreFn<TQuery>;
    hasNext: boolean;
    hasPrevious: boolean;
    isLoadingNext: boolean;
    isLoadingPrevious: boolean;
    refetch: RefetchFnDynamic<TQuery, TKey>;
}
export function usePaginationFragment<TQuery extends OperationType, TKey extends KeyType>(
    fragmentInput: GraphQLTaggedNode,
    parentFragmentRef: TKey,
): usePaginationFragmentHookType<TQuery, TKey, KeyTypeData<TKey>>;
export function usePaginationFragment<TQuery extends OperationType, TKey extends KeyType>(
    fragmentInput: GraphQLTaggedNode,
    parentFragmentRef: TKey | null | undefined,
): usePaginationFragmentHookType<TQuery, TKey | null, KeyTypeData<TKey> | null | undefined>;
