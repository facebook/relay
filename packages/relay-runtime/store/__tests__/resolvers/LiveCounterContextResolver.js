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

import type {TestLiveResolverContextType} from '../../../mutations/__tests__/TestLiveResolverContextType';
import type {LiveState} from 'relay-runtime';

/**
 * @RelayResolver Query.counter_context: Int
 * @live
 *
 * A Relay Resolver that returns an object implementing the External State
 * Resolver interface.
 */
function counter_context(
  _: void,
  __: void,
  context: TestLiveResolverContextType,
): LiveState<number> {
  let value = 0;

  return {
    read() {
      return value;
    },
    subscribe(cb): () => void {
      const subscription = context.counter.subscribe({
        next: v => {
          value = v;
          cb();
        },
      });

      return () => subscription.unsubscribe();
    },
  };
}

module.exports = {
  counter_context,
};
