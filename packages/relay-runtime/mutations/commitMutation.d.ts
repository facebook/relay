/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {PayloadError, UploadableMap} from '../network/RelayNetworkTypes';
import { GraphQLTaggedNode } from '../query/GraphQLTag';
import {Environment, SelectorStoreUpdater} from '../store/RelayStoreTypes';
import {CacheConfig, Disposable} from '../util/RelayRuntimeTypes';
import { DeclarativeMutationConfig } from './RelayDeclarativeMutationConfig';

export interface MutationParameters {
    readonly response: Record<string, unknown>;
    readonly variables: Record<string, unknown>;
    readonly rawResponse?: Record<string, unknown> | undefined;
}

export interface MutationConfig<TOperation extends MutationParameters> {
    configs?: DeclarativeMutationConfig[] | undefined;
    cacheConfig?: CacheConfig | undefined;
    mutation: GraphQLTaggedNode;
    onError?: ((error: Error) => void) | null | undefined;
    onCompleted?:
        | ((response: TOperation['response'], errors: readonly PayloadError[] | null | undefined) => void)
        | null
        | undefined;
    onUnsubscribe?: (() => void | null | undefined) | undefined;
    /**
     * An object whose type matches the raw response type of the mutation. Make sure you decorate
     * your mutation with `@raw_response_type` if you are using this field.
     */
    optimisticResponse?: (TOperation['rawResponse'] extends Record<string, unknown> ? TOperation['rawResponse'] : never) | undefined;
    optimisticUpdater?: SelectorStoreUpdater<TOperation['response']> | null | undefined;
    updater?: SelectorStoreUpdater<TOperation['response']> | null | undefined;
    uploadables?: UploadableMap | null | undefined;
    variables: TOperation['variables'];
}

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
export function commitMutation<TOperation extends MutationParameters = MutationParameters>(
    environment: Environment,
    config: MutationConfig<TOperation>,
): Disposable;
