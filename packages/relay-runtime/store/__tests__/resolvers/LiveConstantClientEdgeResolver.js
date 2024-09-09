/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {ConcreteClientEdgeResolverReturnType} from 'relay-runtime';
import type {LiveState} from 'relay-runtime';

/**
 * @RelayResolver Query.live_constant_client_edge: User
 * @live
 */
function live_constant_client_edge(): LiveState<
  ConcreteClientEdgeResolverReturnType<>,
> {
  return {
    read() {
      return {id: '1338'};
    },
    subscribe(cb) {
      return () => {};
    },
  };
}

module.exports = {
  live_constant_client_edge,
};
