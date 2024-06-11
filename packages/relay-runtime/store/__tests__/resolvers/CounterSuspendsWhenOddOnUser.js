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
const {suspenseSentinel} = require('relay-runtime');

/**
 * @RelayResolver
 * @fieldName counter_suspends_when_odd
 * @onType User
 * @live
 *
 * A Relay Resolver that returns an object implementing the External State
 * Resolver interface.
 */
function counter_suspends_when_odd(): LiveState<number> {
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
