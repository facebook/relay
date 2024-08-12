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
 * @RelayResolver User.client_object(return_null: Boolean!): ClientObject
 *
 * Returns a weak ClientObject or null depending upon the argument.
 */
function client_object(
  _: void,
  args: {
    return_null: boolean,
  },
): {description: string} | null {
  if (args.return_null) {
    return null;
  }
  return {description: 'Hello world'};
}

module.exports = {
  client_object,
};
