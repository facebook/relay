/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { RelayObservable } from '../network/RelayObservable';
import { Environment } from '../store/RelayStoreTypes';
import {CacheConfig, FetchQueryFetchPolicy, OperationType} from '../util/RelayRuntimeTypes';
import { GraphQLTaggedNode } from './GraphQLTag';

export function fetchQuery<T extends OperationType>(
    environment: Environment,
    taggedNode: GraphQLTaggedNode,
    variables: T['variables'],
    cacheConfig?: {
        networkCacheConfig?: CacheConfig | null | undefined;
        fetchPolicy?: FetchQueryFetchPolicy | null | undefined;
    } | null,
): RelayObservable<T['response']>;
