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
 * @RelayResolver
 * @fieldName counter_no_fragment
 * @onType Query
 * @live
 *
 * A Relay Resolver that returns an object implementing the External State
 * Resolver interface.
 */
function counter_no_fragment(): LiveState<number> {
  counter_no_fragment.callCount += 1;
  return {
    read() {
      return Selectors.getNumber(GLOBAL_STORE.getState());
    },
    subscribe(cb): () => void {
      // Here we could try to run the selector and short-circuit if the value has
      // not changed, but for now we'll over-notify.
      return GLOBAL_STORE.subscribe(cb);
    },
  };
}

counter_no_fragment.callCount = 0;

module.exports = {
  counter_no_fragment,
};
