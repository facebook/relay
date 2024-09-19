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

import type {UserRequiredNameResolver$key} from './__generated__/UserRequiredNameResolver.graphql';

const invariant = require('invariant');
const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * Represents the number of times the required_name resolver has been called
 * and gotten past readFragment.
 */
const requiredThrowNameCalls: {count: number} = {count: 0};

/**
 * @RelayResolver User.required_throw_name: String
 * @rootFragment UserRequiredThrowNameResolver
 */
function required_name(rootKey: UserRequiredNameResolver$key): string {
  const user = readFragment(
    graphql`
      fragment UserRequiredThrowNameResolver on User {
        name @required(action: THROW)
      }
    `,
    rootKey,
  );
  requiredThrowNameCalls.count++;
  invariant(
    user != null,
    'This error should never throw because the @required should ensure this code never runs',
  );
  return user.name;
}

module.exports = {
  required_name,
  requiredThrowNameCalls,
};
