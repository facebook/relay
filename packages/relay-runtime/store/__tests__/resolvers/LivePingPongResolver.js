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

import type {LivePingPongResolver$key} from './__generated__/LivePingPongResolver.graphql';
import type {LiveState} from 'relay-runtime/store/experimental-live-resolvers/LiveResolverStore';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName ping
 * @rootFragment LivePingPongResolver
 * @onType Query
 * @live
 *
 * A @live Relay resolver that synchronously triggers an update on initial
 * subscribe. This is intended to exercise an edge case in Relay's handling of
 * Live Resolvers.
 */
function ping(rootKey: LivePingPongResolver$key): LiveState<string> {
  readFragment(
    graphql`
      fragment LivePingPongResolver on Query {
        # We don't need to read any Relay state here, but this works for now
        me {
          __id
        }
      }
    `,
    rootKey,
  );
  let value = 'ping';
  return {
    read() {
      return value;
    },
    subscribe(cb): () => void {
      value = 'pong';
      cb();
      return () => {};
    },
  };
}

module.exports = {
  ping,
};
