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

import type {UserAlwaysThrowsResolver$key} from './__generated__/UserAlwaysThrowsResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName always_throws
 * @rootFragment UserAlwaysThrowsResolver
 * @onType User
 *
 * A Relay Resolver that always throws when evaluated.
 */
function userAlwaysThrows(rootKey: UserAlwaysThrowsResolver$key): string {
  readFragment(
    graphql`
      fragment UserAlwaysThrowsResolver on User {
        __typename
      }
    `,
    rootKey,
  );
  throw new Error('I always throw. What did you expect?');
}

module.exports = userAlwaysThrows;
