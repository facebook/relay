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

/**
 * @RelayResolver
 * @fieldName non_live_resolver_with_live_return_value
 * @onType Query
 *
 * A non-@live resolver that returns a LiveObject
 */
function non_live_resolver_with_live_return_value(): LiveState<string> {
  return {
    read() {
      return 'Oops!';
    },
    subscribe(cb) {
      return () => {};
    },
  };
}

module.exports = {
  non_live_resolver_with_live_return_value,
};
