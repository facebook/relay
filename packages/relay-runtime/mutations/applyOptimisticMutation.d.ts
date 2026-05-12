/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GraphQLTaggedNode } from '../query/GraphQLTag';
import {Environment, SelectorStoreUpdater} from '../store/RelayStoreTypes';
import {Disposable, Variables} from '../util/RelayRuntimeTypes';
import { DeclarativeMutationConfig } from './RelayDeclarativeMutationConfig';

export interface OptimisticMutationConfig {
    configs?: readonly DeclarativeMutationConfig[] | null | undefined;
    mutation: GraphQLTaggedNode;
    variables: Variables;
    optimisticUpdater?: SelectorStoreUpdater | null | undefined;
    optimisticResponse?: object | undefined;
}

/**
 * Higher-level helper function to execute a mutation against a specific
 * environment.
 */
export function applyOptimisticMutation(environment: Environment, config: OptimisticMutationConfig): Disposable;
