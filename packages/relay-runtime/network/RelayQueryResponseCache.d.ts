/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { GraphQLResponse } from '../network/RelayNetworkTypes';
import { Variables } from '../util/RelayRuntimeTypes';

export default class RelayQueryResponseCache {
    constructor(config: { size: number; ttl: number });
    clear(): void;
    get(queryID: string, variables: Variables): GraphQLResponse | null;
    set(queryID: string, variables: Variables, payload: GraphQLResponse): void;
}
