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

/**
 * @RelayResolver Query.non_live_resolver_with_live_return_value: String
 *
 * A non-@live resolver that returns a LiveObject
 */
function non_live_resolver_with_live_return_value(): string {
  // $FlowFixMe[incompatible-type] This is an intentionally wrong type to test what happens when you return a LiveObject from a non-@live resolver.
  return {
    read() {
      return 'Oops!';
    },
    subscribe() {
      return () => {};
    },
  };
}

module.exports = {
  non_live_resolver_with_live_return_value,
};
