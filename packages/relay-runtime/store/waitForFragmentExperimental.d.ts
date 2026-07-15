/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { GraphQLTaggedNode } from '../query/GraphQLTag';
import type {ArrayKeyType, ArrayKeyTypeData, Environment as IEnvironment, KeyType, KeyTypeData} from './RelayStoreTypes';

/**
 * EXPERIMENTAL: This API is experimental and does not yet support all Relay
 * features. Notably, it does not correctly handle some features of Relay Resolvers.
 *
 * Given a fragment and a fragment reference, returns a promise that resolves
 * once the fragment data is available, or rejects if the fragment has an error.
 * Errors include both network errors and field errors due to @required(action:
 * THROW) or @throwOnFieldError.

 * This API is intended for use when consuming data outside of a UI framework, or
 * when you need to imperatively access data inside an event handler. For example,
 * you might choose to @defer a fragment that you only need to access inside an
 * event handler and then await its value inside the handler if/when it is triggered.
 */
export function waitForFragmentData<TKey extends KeyType>(
    environment: IEnvironment,
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey,
): Promise<KeyTypeData<TKey>>;

/**
 * EXPERIMENTAL: This API is experimental and does not yet support all Relay
 * features. Notably, it does not correctly handle some features of Relay Resolvers.
 *
 * Given a fragment and a fragment reference, returns a promise that resolves
 * once the fragment data is available, or rejects if the fragment has an error.
 * Errors include both network errors and field errors due to @required(action:
 * THROW) or @throwOnFieldError.

 * This API is intended for use when consuming data outside of a UI framework, or
 * when you need to imperatively access data inside an event handler. For example,
 * you might choose to @defer a fragment that you only need to access inside an
 * event handler and then await its value inside the handler if/when it is triggered.
 */
export function waitForFragmentData<TKey extends ArrayKeyType>(
    environment: IEnvironment,
    fragmentInput: GraphQLTaggedNode,
    fragmentRef: TKey,
): Promise<ArrayKeyTypeData<TKey>>;
