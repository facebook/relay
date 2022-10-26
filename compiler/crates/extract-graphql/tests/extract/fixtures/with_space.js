/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

graphql `
    fragment Foo1 on User {
        __typename
    }
`

graphql    `
    fragment Foo2 on User {
        __typename
    }
`

graphql
`
    fragment Foo3 on User {
        __typename
    }
`

graphql	`
    fragment Foo4 on User {
        __typename
    }
`
