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
 * @RelayResolver Query.hello_optional_world(world: String): String
 *
 * Say `Hello ${world}!` with a fallback if world is null
 */
function hello_optional_world(_: void, args: {world: ?string}): string {
  return `Hello, ${args.world ?? 'Default'}!`;
}

module.exports = {
  hello_optional_world,
};
