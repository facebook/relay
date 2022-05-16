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

import type {DummyUserGreetingResolver$key} from './__generated__/DummyUserGreetingResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName greeting
 * @rootFragment DummyUserGreetingResolver
 * @onType User
 *
 * Greet the user.
 */
function userGreeting(rootKey: DummyUserGreetingResolver$key): string {
  const user = readFragment(
    graphql`
      fragment DummyUserGreetingResolver on User {
        name
      }
    `,
    rootKey,
  );
  const name = user.name ?? 'Stranger';
  return `Hello, ${name}!`;
}

module.exports = userGreeting;
