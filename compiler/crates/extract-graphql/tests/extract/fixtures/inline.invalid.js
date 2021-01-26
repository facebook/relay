/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// expected-to-throw

blah

graphql`
    fragment Foo on ${type} {
        __typename
    }
`
