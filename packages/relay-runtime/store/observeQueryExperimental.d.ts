/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { RelayObservable as Observable } from '../network/RelayObservable';
import type { GraphQLTaggedNode } from '../query/GraphQLTag';
import type { OperationType } from '../util/RelayRuntimeTypes';
import type {Environment as IEnvironment, FragmentState} from './RelayStoreTypes';

/**
 * This function returns an observable that can be used to subscribe to the data
 * contained in a query. It does not return the full response shape, but rather
 * the contents of the query body minus any fragment spreads.  If you wish to
 * read the contents of a fragment spread into this query you may pass the
 * object into which the fragment was spread to `observeFragment`.
 *
 * NOTE: `observeQuery` assumes that you have already fetched and retained the
 * query via some other means, such as `fetchQuery`.
 *
 * This feature is still experimental and does not properly handle some resolver
 * features such as client-to-server edges.
 */
export function observeQuery<T extends OperationType>(
    environment: IEnvironment,
    gqlQuery: GraphQLTaggedNode,
    variables: T['variables'],
): Observable<FragmentState<T['response']>>;
