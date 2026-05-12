/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { RelayObservable as Observable } from '../network/RelayObservable';
import type { GraphQLTaggedNode } from '../query/GraphQLTag';
import type {ArrayKeyType, ArrayKeyTypeData, Environment as IEnvironment, FragmentState, KeyType, KeyTypeData} from './RelayStoreTypes';

/**
 * EXPERIMENTAL: This API is experimental and does not yet support all Relay
 * features. Notably, it does not correctly handle some features of Relay Resolvers.
 *
 * Given a fragment and a fragment reference, returns an observable that emits
 * the state of the fragment over time. The observable will emit the following
 * values:
 * - 'ok': The fragment has a value
 * - 'error': The fragment has an error, this could be due to a network error or
 *  a field error due to @required(action: THROW) or @throwOnFieldError
 * - 'loading': The fragment is still in flight and is still expected to resolver.
 */
export function observeFragment<TKey extends KeyType>(
    environment: IEnvironment,
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey,
): Observable<FragmentState<KeyTypeData<TKey>>>;

/**
 * EXPERIMENTAL: This API is experimental and does not yet support all Relay
 * features. Notably, it does not correctly handle some features of Relay Resolvers.
 *
 * Given a fragment and a fragment reference, returns an observable that emits
 * the state of the fragment over time. The observable will emit the following
 * values:
 * - 'ok': The fragment has a value
 * - 'error': The fragment has an error, this could be due to a network error or
 *  a field error due to @required(action: THROW) or @throwOnFieldError
 * - 'loading': The fragment is still in flight and is still expected to resolver.
 */
export function observeFragment<TKey extends ArrayKeyType>(
    environment: IEnvironment,
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey,
): Observable<FragmentState<ArrayKeyTypeData<TKey>>>;
