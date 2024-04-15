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

import type {UserAlwaysThrowsTransitivelyResolver$key} from './__generated__/UserAlwaysThrowsTransitivelyResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver User.always_throws_transitively: String
 * @rootFragment UserAlwaysThrowsTransitivelyResolver
 *
 * A Relay Resolver that reads another resolver which will always throw.
 */
function always_throws_transitively(
  rootKey: UserAlwaysThrowsTransitivelyResolver$key,
): ?string {
  const user = readFragment(
    graphql`
      fragment UserAlwaysThrowsTransitivelyResolver on User {
        always_throws
      }
    `,
    rootKey,
  );
  return user.always_throws;
}

module.exports = {
  always_throws_transitively,
};
