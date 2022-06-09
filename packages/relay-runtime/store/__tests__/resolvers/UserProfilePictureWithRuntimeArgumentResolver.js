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

import type {UserProfilePictureWithRuntimeArgumentResolver$key} from './__generated__/UserProfilePictureWithRuntimeArgumentResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName user_profile_picture_uri_with_scale_and_additional_argument(name: String)
 * @rootFragment UserProfilePictureWithRuntimeArgumentResolver
 * @onType User
 */
function UserProfilePictureWithRuntimeArgumentResolver(
  rootKey: UserProfilePictureWithRuntimeArgumentResolver$key,
  args: mixed,
): ?string {
  const {name} = args != null && typeof args === 'object' ? args : {};

  const user = readFragment(
    graphql`
      fragment UserProfilePictureWithRuntimeArgumentResolver on User
      @argumentDefinitions(scale: {type: "Float"}) {
        profile_picture(scale: $scale) {
          uri
        }
      }
    `,
    rootKey,
  );
  return `${String(name)}: ${String(user?.profile_picture?.uri)}`;
}

module.exports = UserProfilePictureWithRuntimeArgumentResolver;
