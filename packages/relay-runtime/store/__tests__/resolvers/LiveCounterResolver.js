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

'use strict';

import type {LiveCounterResolver$key} from './__generated__/LiveCounterResolver.graphql';
import type {LiveState} from 'relay-runtime/store/experimental-live-resolvers/LiveResolverStore';

const {GLOBAL_STORE, Selectors} = require('./ExampleExternalStateStore');
const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName counter
 * @rootFragment LiveCounterResolver
 * @onType Query
 * @live
 *
 * A Relay Resolver that returns an object implementing the External State
 * Resolver interface.
 */
function counter(rootKey: LiveCounterResolver$key): LiveState<number> {
  readFragment(
    graphql`
      fragment LiveCounterResolver on Query {
        # We don't need to read any Relay state here, but this works for now
        me {
          __id
        }
      }
    `,
    rootKey,
  );
  return {
    read() {
      return Selectors.getNumber(GLOBAL_STORE.getState());
    },
    subscribe(cb): () => void {
      // Here we could try to run the selector and short-circut if the value has
      // not changed, but for now we'll over-notify.
      return GLOBAL_STORE.subscribe(cb);
    },
  };
}

module.exports = counter;
