/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// expected-to-throw

/**
 * @RelayResolver User.greeting(salutation: String!, first: Int!): RelayResolverValue
 * @rootFragment myRootFragment
 *
 */

graphql`
  fragment myRootFragment on User @argumentDefinitions(first: {type: "Int", defaultValue: 10}, userID: {type: "ID!"}) {
    name
  }
`
