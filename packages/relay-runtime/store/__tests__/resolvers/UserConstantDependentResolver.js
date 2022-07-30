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

'use strict';

import type {UserConstantDependentResolver$key} from './__generated__/UserConstantDependentResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName constant_dependent
 * @rootFragment UserConstantDependentResolver
 * @onType User
 */
function UserConstantDependentResolver(
  rootKey: UserConstantDependentResolver$key,
): number {
  const user = readFragment(
    graphql`
      fragment UserConstantDependentResolver on User {
        constant
      }
    `,
    rootKey,
  );
  UserConstantDependentResolver._relayResolverTestCallCount =
    (UserConstantDependentResolver._relayResolverTestCallCount ?? 0) + 1;
  return (user.constant ?? NaN) + 1;
}

module.exports = UserConstantDependentResolver;
