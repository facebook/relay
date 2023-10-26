/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// relay:allow_legacy_verbose_syntax

/**
 * @RelayResolver MyType
 */

/**
 * @RelayResolver
 * @onType MyType
 * @fieldName my_field
 * @rootFragment myRootFragment
 */

graphql`
  fragment myRootFragment on MyType {
    id
  }
`
