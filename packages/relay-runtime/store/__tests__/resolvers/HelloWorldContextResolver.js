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
 * @RelayResolver Query.hello_context: String
 *
 * Say `Hello, ${world}!`
 */
import {resolverContext} from '../../ResolverFragments';

function hello_context(): string {
  const world = resolverContext<{world: string}>().world;
  return `Hello, ${world}!`;
}

module.exports = {
  hello_context,
};
