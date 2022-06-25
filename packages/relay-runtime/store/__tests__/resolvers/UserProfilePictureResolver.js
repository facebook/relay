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

'use strict';

import type {UserProfilePictureResolver$key} from './__generated__/UserProfilePictureResolver.graphql';

const {graphql} = require('relay-runtime');
const {readFragment} = require('relay-runtime/store/ResolverFragments');

/**
 * @RelayResolver
 * @fieldName user_profile_picture_uri_with_scale
 * @rootFragment UserProfilePictureResolver
 * @onType User
 */
function userProfilePicture(rootKey: UserProfilePictureResolver$key): ?string {
  const user = readFragment(
    graphql`
      fragment UserProfilePictureResolver on User
      @argumentDefinitions(scale: {type: "Float"}) {
        profile_picture(scale: $scale) {
          uri
        }
      }
    `,
    rootKey,
  );
  return user?.profile_picture?.uri;
}

module.exports = userProfilePicture;
