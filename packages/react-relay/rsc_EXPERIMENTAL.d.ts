/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ArrayKeyType, ArrayKeyTypeData, KeyType, KeyTypeData} from './ReactRelayTypes';
import {GraphQLTaggedNode, IEnvironment, OperationType} from 'relay-runtime';

export interface PreloadedQueryResponse<TData> {
    readonly data: TData;
    readonly errors?: ReadonlyArray<{ readonly message: string }>;
}

export interface PreloadedQueryRef<TVariables, TData> {
    readonly kind: 'PreloadedQueryRef';
    readonly queryId: string;
    readonly variables: TVariables;
    readonly _response: Promise<PreloadedQueryResponse<TData>>;
    readonly fetchedAt: number;
}

export interface ServerEnvironment {
    readonly getEnvironment: () => IEnvironment;
    readonly serverFetchQuery: <T extends OperationType>(
        query: GraphQLTaggedNode,
        variables: T['variables'],
    ) => Promise<T['response']>;
    readonly serverPreloadQuery: <T extends OperationType>(
        query: GraphQLTaggedNode,
        variables: T['variables'],
    ) => PreloadedQueryRef<T['variables'], T['response']>;
    readonly serverReadFragment: {
        <TKey extends KeyType>(
            fragment: GraphQLTaggedNode,
            fragmentRef: TKey,
        ): Promise<KeyTypeData<TKey>>;
        <TKey extends ArrayKeyType>(
            fragment: GraphQLTaggedNode,
            fragmentRef: TKey,
        ): Promise<ArrayKeyTypeData<TKey>>;
    };
}

export function createServerEnvironment(
    create: () => IEnvironment,
): ServerEnvironment;
