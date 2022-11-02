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
 * @RelayResolver
 * @fieldName hello(world: String!)
 * @onType Query
 *
 * Say `Hello ${world}!`
 */
function hello(args: {world: string}): string {
  return `Hello, ${args.world}!`;
}

module.exports = {
  hello,
};
