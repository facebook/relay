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
 * @onType MyType
 * @fieldName some_interface_field
 * @rootFragment myRootFragment
 *
 */

 graphql`
 fragment myRootFragment on MyType {
   id
 }
`

// %extensions%

graphql`
interface MyInterface {
    some_interface_field: String
}

type MyType implements MyInterface {
    id: ID!
}
`;