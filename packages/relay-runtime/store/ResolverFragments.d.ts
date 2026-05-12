/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { GraphQLTaggedNode } from '../query/GraphQLTag';
import type {ArrayKeyType, ArrayKeyTypeData, FragmentType, KeyType, KeyTypeData, SingularReaderSelector} from './RelayStoreTypes';

export interface ResolverContext {
    getDataForResolverFragment: (
        arg0: SingularReaderSelector,
        arg1: FragmentType,
    ) => {
        data: unknown;
        isMissingData: boolean;
    };
}

export const RESOLVER_FRAGMENT_MISSING_DATA_SENTINEL: unknown;

export function withResolverContext<T>(context: ResolverContext, cb: () => T): T;

export function readFragment<TKey extends KeyType>(
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey,
): KeyTypeData<TKey>;

export function readFragment<TKey extends KeyType>(
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey | null,
): KeyTypeData<TKey> | null;

export function readFragment<TKey extends ArrayKeyType>(
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey,
): ArrayKeyTypeData<TKey>;

export function readFragment<TKey extends ArrayKeyType>(
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey | null,
): ArrayKeyTypeData<TKey> | null;
