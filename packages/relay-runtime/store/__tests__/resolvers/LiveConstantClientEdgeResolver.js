/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {DataID} from 'relay-runtime';
import type {LiveState} from 'relay-runtime/store/experimental-live-resolvers/LiveResolverStore';

/**
 * @RelayResolver
 * @fieldName live_constant_client_edge
 * @onType Query
 * @edgeTo User
 * @live
 */
function LiveConstantClientEdgeResolver(): LiveState<DataID> {
  return {
    read() {
      return '1338';
    },
    subscribe(cb) {
      return () => {};
    },
  };
}

module.exports = LiveConstantClientEdgeResolver;
