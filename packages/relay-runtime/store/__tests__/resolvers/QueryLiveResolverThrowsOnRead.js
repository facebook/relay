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

import type {LiveState} from 'relay-runtime';

const {GLOBAL_STORE, Selectors} = require('./ExampleExternalStateStore');

/**
 * @RelayResolver Query.counter_throws_when_odd: Int
 * @live
 *
 * A @live resolver that throws when counter is odd. Useful for testing
 * behavior of live resolvers that throw on read.
 */

function counter_throws_when_odd(): LiveState<number> {
  return {
    read() {
      const number = Selectors.getNumber(GLOBAL_STORE.getState());
      if (number % 2 !== 0) {
        throw new Error('What?');
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
  counter_throws_when_odd,
};
