/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// expected-to-throw
// relay:allow_legacy_relay_resolver_tag

graphql`
  fragment myRootFragment on User {
    name
  }
`

/**
 * @RelayResolver User.my_field: RelayResolverValue
 * @rootFragment missingFragment
 */
