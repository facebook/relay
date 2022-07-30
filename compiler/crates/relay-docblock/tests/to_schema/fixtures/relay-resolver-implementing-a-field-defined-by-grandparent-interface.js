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

interface GrandparentInterface {
    some_interface_field: String
}

interface MyInterface implements GrandparentInterface {
    some_interface_field: String
}

type MyType implements MyInterface {
    id: ID!
}
`;