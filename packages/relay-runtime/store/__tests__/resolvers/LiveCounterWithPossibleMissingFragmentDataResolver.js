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

import type {LiveCounterWithPossibleMissingFragmentDataResolverFragment$key} from './__generated__/LiveCounterWithPossibleMissingFragmentDataResolverFragment.graphql';
import type {LiveState} from 'relay-runtime';

const {GLOBAL_STORE, Selectors} = require('./ExampleExternalStateStore');
const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver Query.live_counter_with_possible_missing_fragment_data: Int
 * @rootFragment LiveCounterWithPossibleMissingFragmentDataResolverFragment
 * @live
 */
function live_counter_with_possible_missing_fragment_data(
  rootKey: LiveCounterWithPossibleMissingFragmentDataResolverFragment$key,
): LiveState<number> {
  readFragment(
    graphql`
      fragment LiveCounterWithPossibleMissingFragmentDataResolverFragment on Query {
        me {
          id @required(action: THROW)
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
      // Here we could try to run the selector and short-circuit if the value has
      // not changed, but for now we'll over-notify.
      return GLOBAL_STORE.subscribe(cb);
    },
  };
}

module.exports = {
  live_counter_with_possible_missing_fragment_data,
};
