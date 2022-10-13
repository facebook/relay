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

import type {UserGreetingResolver$key} from './__generated__/UserGreetingResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName greeting
 * @rootFragment UserGreetingResolver
 * @onType User
 *
 * Greet the user.
 */
function greeting(rootKey: UserGreetingResolver$key): string {
  const user = readFragment(
    graphql`
      fragment UserGreetingResolver on User {
        name
      }
    `,
    rootKey,
  );
  const name = user.name ?? 'Stranger';
  return `Hello, ${name}!`;
}

module.exports = {
  greeting,
};
