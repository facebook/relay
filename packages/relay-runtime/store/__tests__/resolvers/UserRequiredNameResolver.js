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
 * @RelayResolver
 * @fieldName required_name
 * @rootFragment UserRequiredNameResolver
 * @onType User
 */
function required_name(rootKey: UserRequiredNameResolver$key): string {
  const user = readFragment(
    graphql`
      fragment UserRequiredNameResolver on User {
        name @required(action: LOG)
      }
    `,
    rootKey,
  );
  invariant(user != null);
  return user.name;
}

module.exports = {
  required_name,
};
