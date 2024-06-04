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

const {resolverContext} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver Query.hello_world_with_context_object: String
 * @live
 *
 * Say `Hello ${world}!`
 */
function hello_world_with_context_object(): LiveState<string> {
  const dependency = resolverContext<{greeting: {myHello: string}}>();

  return {
    read() {
      return `Hello ${dependency.greeting.myHello}!`;
    },

    subscribe(callback) {
      return () => {
        // no-op
      };
    },
  };
}

module.exports = {
  hello_world_with_context_object,
};
