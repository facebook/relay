/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {UserAlwaysThrowsTransitivelyResolver$key} from './__generated__/UserAlwaysThrowsTransitivelyResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName always_throws_transitively
 * @rootFragment UserAlwaysThrowsTransitivelyResolver
 * @onType User
 *
 * A Relay Resolver that reads another resolver which will always throw.
 */
function userAlwaysThrowsTransitively(
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

module.exports = userAlwaysThrowsTransitively;
