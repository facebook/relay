/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @RelayResolver User.greeting(salutation: String!): RelayResolverValue
 * @rootFragment myRootFragment
 *
 */

graphql`
  fragment myRootFragment on User {
    name
  }
`
