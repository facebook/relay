/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// relay:allow_legacy_verbose_syntax

/**
 * @RelayResolver
 *
 * @onType User
 * @fieldName favorite_page
 * @edgeTo Page
 * @rootFragment myRootFragment
 * @deprecated This one is not used any more
 */


graphql`
  fragment myRootFragment on User {
    id
  }
`
