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

import type {CounterSuspendsWhenOdd$key} from './__generated__/CounterSuspendsWhenOdd.graphql';
import type {LiveState} from 'relay-runtime';

const {GLOBAL_STORE, Selectors} = require('./ExampleExternalStateStore');
const {graphql, suspenseSentinel} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver Query.counter_suspends_when_odd: Int
 * @rootFragment CounterSuspendsWhenOdd
 * @live
 *
 * A Relay Resolver that returns an object implementing the External State
 * Resolver interface.
 */
function counter_suspends_when_odd(
  rootKey: CounterSuspendsWhenOdd$key,
): LiveState<number> {
  readFragment(
    graphql`
      fragment CounterSuspendsWhenOdd on Query {
        me {
          __id
        }
      }
    `,
    rootKey,
  );
  return {
    read() {
      const number = Selectors.getNumber(GLOBAL_STORE.getState());
      if (number % 2 !== 0) {
        return suspenseSentinel();
      } else {
        return number;
      }
    },
    subscribe(cb): () => void {
      // Here we could try to run the selector and short-circuit if
      // the value has not changed, but for now we'll over-notify.
      return GLOBAL_STORE.subscribe(cb);
    },
  };
}

module.exports = {
  counter_suspends_when_odd,
};
