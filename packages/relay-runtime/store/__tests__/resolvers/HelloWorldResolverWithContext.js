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

import type {TestResolverContextType} from '../../../mutations/__tests__/TestResolverContextType';
import type {LiveState} from 'relay-runtime';

/**
 * @RelayResolver Query.hello_world_with_context: String
 * @live
 *
 * Say `Hello ${world}!`
 */
function hello_world_with_context(
  _: void,
  __: void,
  context: TestResolverContextType,
): LiveState<string> {
  return {
    read() {
      return `Hello ${context.greeting.myHello}!`;
    },

    subscribe(callback) {
      return () => {
        // no-op
      };
    },
  };
}

module.exports = {
  hello_world_with_context,
};
