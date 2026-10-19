/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// expected-to-throw
// relay:enable_relay_rsc

/**
 * @relayField User.avatarRsc(size: [Int!]!): RelayRscValue
 * @rootFragment UserAvatarRsc_user
 */
graphql`
  fragment UserAvatarRsc_user on User
  @argumentDefinitions(size: {type: "[String!]!"})
  @server {
    name
  }
`;
