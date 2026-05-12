/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Environment } from '../store/RelayStoreTypes';
import {CacheConfig, OperationType} from '../util/RelayRuntimeTypes';
import { GraphQLTaggedNode } from './GraphQLTag';

export function fetchQuery_DEPRECATED<T extends OperationType>(
    environment: Environment,
    taggedNode: GraphQLTaggedNode,
    variables: T['variables'],
    cacheConfig?: CacheConfig | null,
): Promise<T['response']>;
