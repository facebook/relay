/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const {graphql} = require('relay-runtime/query/GraphQLTag');

graphql`
  fragment SomeDeeplyNestedFragment on User @no_inline {
    name
  }
`;
