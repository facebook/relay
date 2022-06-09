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

import type {UserNameAndCounterSuspendsWhenOdd$key} from './__generated__/UserNameAndCounterSuspendsWhenOdd.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName user_name_and_counter_suspends_when_odd
 * @rootFragment UserNameAndCounterSuspendsWhenOdd
 * @onType Query
 *
 */
function UserNameAndCounterSuspendsWhenOdd(
  rootKey: UserNameAndCounterSuspendsWhenOdd$key,
): string {
  const data = readFragment(
    graphql`
      fragment UserNameAndCounterSuspendsWhenOdd on Query {
        me {
          name
        }
        counter_suspends_when_odd
      }
    `,
    rootKey,
  );
  return `${String(data.me?.name)} ${String(data.counter_suspends_when_odd)}`;
}

module.exports = UserNameAndCounterSuspendsWhenOdd;
