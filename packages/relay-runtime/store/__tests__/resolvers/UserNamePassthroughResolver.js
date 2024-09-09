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

import type {UserNamePassthroughResolver$key} from './__generated__/UserNamePassthroughResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver User.name_passthrough: String
 * @rootFragment UserNamePassthroughResolver
 */
function name_passthrough(rootKey: UserNamePassthroughResolver$key): ?string {
  const user = readFragment(
    graphql`
      fragment UserNamePassthroughResolver on User {
        name
      }
    `,
    rootKey,
  );
  return user.name;
}

module.exports = {
  name_passthrough,
};
