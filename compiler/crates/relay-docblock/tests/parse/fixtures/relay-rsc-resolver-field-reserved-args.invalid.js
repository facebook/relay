/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// relay:enable_relay_rsc
// expected-to-throw

/**
 * @relayField User.fullNameRsc: RelayRscValue
 * @rootFragment UserFullNameRsc_args
 */
graphql`
  fragment UserFullNameRsc_args on User @server {
    firstName
    lastName
  }
`;
