/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {KeyType, KeyTypeData, RefetchFnDynamic} from '../ReactRelayTypes';
import {GraphQLTaggedNode, OperationType} from 'relay-runtime';

export type useRefetchableFragmentHookType<
    TQuery extends OperationType,
    TKey extends KeyType | null | undefined,
    TFragmentData,
> = [TFragmentData, RefetchFnDynamic<TQuery, TKey>];
export function useRefetchableFragment<TQuery extends OperationType, TKey extends KeyType>(
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey,
): useRefetchableFragmentHookType<TQuery, TKey, KeyTypeData<TKey>>;
export function useRefetchableFragment<TQuery extends OperationType, TKey extends KeyType>(
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey | null | undefined,
): useRefetchableFragmentHookType<TQuery, TKey, KeyTypeData<TKey> | null | undefined>;
