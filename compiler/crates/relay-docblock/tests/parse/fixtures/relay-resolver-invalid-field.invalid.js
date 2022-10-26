/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// expected-to-throw

/**
 * @RelayResolver
 * @onType User
 * @fieldName favorite_page
 * @edgeTo Page
 * @rootFragment myRootFragment
 * @notValid myRootFragment
 */

graphql`
  fragment myRootFragment on User {
    name
  }
`
