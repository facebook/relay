/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @RelayResolver ClientUser implements IFoo & IBar
 */

// %extensions%

graphql`

interface IFoo {
  id: ID!
  other_fields: String
  dont_matter: String
}

interface IBar {
  id: ID!
}
`
