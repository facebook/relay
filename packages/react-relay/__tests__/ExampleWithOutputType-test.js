/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

'use strict';

const {graphql} = require('relay-runtime');

test('should compile a query with complex object type', () => {
  graphql`
    query ExampleWithOutputTypeTestQuery {
      example_client_object {
        description
      }
    }
  `;
});
