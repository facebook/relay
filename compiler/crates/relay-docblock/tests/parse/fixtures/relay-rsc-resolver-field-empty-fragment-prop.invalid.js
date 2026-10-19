/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// relay:enable_relay_rsc
// expected-to-throw

/**
 * @relayField User.userPanel: RelayRscValue
 * @rootFragment UserPanel_
 */
graphql`
  fragment UserPanel_ on User @server {
    name
  }
`;
