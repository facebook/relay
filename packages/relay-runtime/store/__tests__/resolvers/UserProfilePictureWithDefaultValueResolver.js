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

import type {UserProfilePictureWithDefaultValueResolver$key} from './__generated__/UserProfilePictureWithDefaultValueResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName user_profile_picture_uri_with_scale_and_default_value
 * @rootFragment UserProfilePictureWithDefaultValueResolver
 * @onType User
 */
function user_profile_picture_uri_with_scale_and_default_value(
  rootKey: UserProfilePictureWithDefaultValueResolver$key,
): ?string {
  const user = readFragment(
    graphql`
      fragment UserProfilePictureWithDefaultValueResolver on User
      @argumentDefinitions(scale: {type: "Float", defaultValue: 1.5}) {
        profile_picture(scale: $scale) {
          uri
        }
      }
    `,
    rootKey,
  );
  return user?.profile_picture?.uri;
}

module.exports = {
  user_profile_picture_uri_with_scale_and_default_value,
};
