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
 * @onType Query
 * @fieldName favorite_page
 * @edgeTo Page
 * @rootFragment myRootFragment
 */

graphql`
  fragment myRootFragment on User {
    name
  }
`
