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

import type {UserConstantDependentResolver$key} from './__generated__/UserConstantDependentResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver User.constant_dependent: Int
 * @rootFragment UserConstantDependentResolver
 */
function constant_dependent(
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
  constant_dependent._relayResolverTestCallCount =
    (constant_dependent._relayResolverTestCallCount ?? 0) + 1;
  return (user.constant ?? NaN) + 1;
}
constant_dependent._relayResolverTestCallCount = undefined as number | void;

module.exports = {
  constant_dependent,
};
