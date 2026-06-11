/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {KeyType, KeyTypeData, RefetchFnDynamic} from '../ReactRelayTypes';
import {LoadMoreFn} from './useLoadMoreFunction';
import {GraphQLTaggedNode, OperationType, VariablesOf} from 'relay-runtime';

export interface PrefetchableForwardPaginationReturn<
    TQuery extends OperationType,
    TKey extends KeyType | null | undefined,
    TFragmentData,
    TEdgeData,
> {
    data: TFragmentData;
    loadNext: LoadMoreFn<TQuery>;
    hasNext: boolean;
    isLoadingNext: boolean;
    refetch: RefetchFnDynamic<TQuery, TKey>;
    edges: TEdgeData;
}

export type GetExtraVariablesFn<TQuery extends OperationType, TFragmentData, TEdgeData> = (args: {
    hasNext: boolean;
    data: TFragmentData;
    getServerEdges: () => TEdgeData;
}) => Partial<VariablesOf<TQuery>>;

export interface PrefetchingLoadMoreOptions<TQuery extends OperationType, TFragmentData, TEdgeData> {
    UNSTABLE_extraVariables?:
        | Partial<VariablesOf<TQuery>>
        | GetExtraVariablesFn<TQuery, TFragmentData, TEdgeData>
        | undefined;
    onComplete?: ((error: Error | null) => void) | undefined;
}

export function usePrefetchableForwardPaginationFragment<
    TQuery extends OperationType,
    TKey extends KeyType,
    TEdgeData,
>(
    fragmentInput: GraphQLTaggedNode,
    parentFragmentRef: TKey,
    bufferSize: number,
    initialSize?: number | null | undefined,
    prefetchingLoadMoreOptions?: PrefetchingLoadMoreOptions<TQuery, KeyTypeData<TKey>, TEdgeData>,
    minimalFetchSize?: number,
    disablePrefetching?: boolean,
): PrefetchableForwardPaginationReturn<TQuery, TKey, KeyTypeData<TKey>, TEdgeData>;
export function usePrefetchableForwardPaginationFragment<
    TQuery extends OperationType,
    TKey extends KeyType,
    TEdgeData,
>(
    fragmentInput: GraphQLTaggedNode,
    parentFragmentRef: TKey | null | undefined,
    bufferSize: number,
    initialSize?: number | null | undefined,
    prefetchingLoadMoreOptions?: PrefetchingLoadMoreOptions<
        TQuery,
        KeyTypeData<TKey> | null | undefined,
        TEdgeData
    >,
    minimalFetchSize?: number,
    disablePrefetching?: boolean,
): PrefetchableForwardPaginationReturn<TQuery, TKey | null, KeyTypeData<TKey> | null | undefined, TEdgeData>;
