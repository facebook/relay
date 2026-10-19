/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// expected-to-throw

/**
 * @relayField User.fullNameRsc: RelayRscValue
 * @rootFragment UserFullNameRsc_user
 */
graphql`
  fragment UserFullNameRsc_user on User @server {
    firstName
    lastName
  }
`;
