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

import type {UserClientEdgeResolver$key} from './__generated__/UserClientEdgeResolver.graphql';
import type {ConcreteClientEdgeResolverReturnType} from 'relay-runtime';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver User.client_edge: User
 * @rootFragment UserClientEdgeResolver
 */
function client_edge(
  rootKey: UserClientEdgeResolver$key,
): ConcreteClientEdgeResolverReturnType<> {
  readFragment(
    graphql`
      fragment UserClientEdgeResolver on User {
        name
      }
    `,
    rootKey,
  );
  return {id: '1337'};
}

module.exports = {
  client_edge,
};
