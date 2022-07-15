/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// expected-to-throw

/**
 * @RelayResolver
 *
 * @onInterface MyInterface
 * @fieldName some_interface_field
 * @rootFragment myRootFragment
 *
 */

 graphql`
 fragment myRootFragment on MyInterface {
   id
 }
`

// %extensions%

graphql`
interface ParentInterface {
    some_interface_field: String
}

interface MyInterface implements ParentInterface {
    id: ID!
}
`;