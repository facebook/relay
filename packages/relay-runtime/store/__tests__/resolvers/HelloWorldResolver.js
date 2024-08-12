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
 * @RelayResolver Query.hello(world: String!): String
 *
 * Say `Hello ${world}!`
 */
function hello(_: void, args: {world: string}): string {
  return `Hello, ${args.world}!`;
}

module.exports = {
  hello,
};
