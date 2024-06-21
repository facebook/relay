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
import type {LiveState} from 'relay-runtime/store/experimental-live-resolvers/LiveResolverStore';

const {
  suspenseSentinel,
} = require('relay-runtime/store/experimental-live-resolvers/LiveResolverSuspenseSentinel');

/**
 * @RelayResolver
 * @fieldName live_user_resolver_always_suspend
 * @onType Query
 * @edgeTo User
 * @live
 */
function live_user_resolver_always_suspend(): LiveState<
  ConcreteClientEdgeResolverReturnType<>,
> {
  return {
    read() {
      return suspenseSentinel();
    },
    subscribe(cb): () => void {
      return () => {};
    },
  };
}

module.exports = {
  live_user_resolver_always_suspend,
};
