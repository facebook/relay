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

import type {NodeResolversGreeting$key} from './__generated__/NodeResolversGreeting.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver Node.node_greeting: String
 * @rootFragment NodeResolversGreeting
 */
function node_greeting(rootKey: NodeResolversGreeting$key): string {
  const node = readFragment(
    graphql`
      fragment NodeResolversGreeting on Node {
        id
      }
    `,
    rootKey,
  );
  return `Hello Node with id ${node.id}!`;
}

module.exports = {
  node_greeting,
};
