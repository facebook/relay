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

import type {UserLastNameThrowOnFieldErrorResolver$key} from './__generated__/UserLastNameThrowOnFieldErrorResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver User.last_name_throw_on_field_error: String
 * @rootFragment UserLastNameThrowOnFieldErrorResolver
 */
function last_name_throw_on_field_error(
  rootKey: UserLastNameThrowOnFieldErrorResolver$key,
): ?string {
  const user = readFragment(
    graphql`
      fragment UserLastNameThrowOnFieldErrorResolver on User
      @throwOnFieldError {
        lastName
      }
    `,
    rootKey,
  );
  return user.lastName;
}

module.exports = {
  last_name_throw_on_field_error,
};
