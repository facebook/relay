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

import type {AstrologicalSignID} from './AstrologicalSignUtils';
import type {LiveState} from 'relay-runtime/store/experimental-live-resolvers/LiveResolverStore';

const {GLOBAL_STORE, Selectors} = require('./ExampleExternalStateStore');
const {
  suspenseSentinel,
} = require('relay-runtime/store/experimental-live-resolvers/LiveResolverSuspenseSentinel');

/**
 * @RelayResolver Query.virgo_suspends_when_counter_is_odd: AstrologicalSign
 * @live
 *
 * A client edge to a client object that is @live and can suspend
 */
function virgo_suspends_when_counter_is_odd(): LiveState<{
  id: AstrologicalSignID,
}> {
  return {
    read() {
      const number = Selectors.getNumber(GLOBAL_STORE.getState());
      if (number % 2 !== 0) {
        return suspenseSentinel();
      }
      return {id: 'Virgo'};
    },
    subscribe(cb): () => void {
      return GLOBAL_STORE.subscribe(cb);
    },
  };
}

module.exports = {
  virgo_suspends_when_counter_is_odd,
};
