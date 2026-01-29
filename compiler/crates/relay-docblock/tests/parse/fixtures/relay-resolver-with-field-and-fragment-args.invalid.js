/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// expected-to-throw

// relay:allow_legacy_verbose_syntax

/**
 * @RelayResolver
 *
 * @onType User
 * @fieldName greeting(salutation: String!, first: Int!)
 * @rootFragment myRootFragment
 *
 */

graphql`
  fragment myRootFragment on User @argumentDefinitions(first: {type: "Int", defaultValue: 10}, userID: {type: "ID!"}) {
    name
  }
`
