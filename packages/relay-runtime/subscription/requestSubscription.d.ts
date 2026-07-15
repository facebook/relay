/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { DeclarativeMutationConfig } from '../mutations/RelayDeclarativeMutationConfig';
import { GraphQLTaggedNode } from '../query/GraphQLTag';
import {Environment, SelectorStoreUpdater} from '../store/RelayStoreTypes';
import {CacheConfig, Disposable, OperationType} from '../util/RelayRuntimeTypes';

export interface GraphQLSubscriptionConfig<TSubscription extends OperationType> {
    cacheConfig?: CacheConfig | undefined;
    configs?: readonly DeclarativeMutationConfig[] | undefined;
    subscription: GraphQLTaggedNode;
    variables: TSubscription['variables'];
    onCompleted?: (() => void) | undefined;
    onError?: ((error: Error) => void) | undefined;
    onNext?: ((response: TSubscription['response'] | null | undefined) => void) | undefined;
    updater?: SelectorStoreUpdater<TSubscription['response']> | undefined;
}

export function requestSubscription<TSubscription extends OperationType = OperationType>(
    environment: Environment,
    config: GraphQLSubscriptionConfig<TSubscription>,
): Disposable;
