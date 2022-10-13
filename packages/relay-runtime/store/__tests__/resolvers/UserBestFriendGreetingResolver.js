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

import type {UserBestFriendGreetingResolver$key} from './__generated__/UserBestFriendGreetingResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName best_friend_greeting
 * @rootFragment UserBestFriendGreetingResolver
 * @onType User
 */
function best_friend_greeting(
  rootKey: UserBestFriendGreetingResolver$key,
): string {
  const user = readFragment(
    graphql`
      fragment UserBestFriendGreetingResolver on User {
        friends(first: 1) {
          edges {
            cursor
            node {
              name
            }
          }
        }
      }
    `,
    rootKey,
  );
  const name = user?.friends?.edges?.[0]?.node?.name ?? 'Stranger';
  return `Hello, ${name}!`;
}

module.exports = {
  best_friend_greeting,
};
