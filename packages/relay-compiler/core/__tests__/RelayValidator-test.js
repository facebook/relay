/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQL = require('graphql');
const RelayTestSchema = require('RelayTestSchema');
const RelayValidator = require('RelayValidator');

function validateString(input) {
  const ast = GraphQL.parse(new GraphQL.Source(input, 'test.graphql'));
  return () => {
    RelayValidator.validate(ast, RelayTestSchema, RelayValidator.LOCAL_RULES);
  };
}

test('id alias validation', () => {
  expect(validateString('fragment Test on User { id }')).not.toThrow();

  expect(validateString('fragment Test on User { id: id }')).not.toThrow();

  expect(
    validateString('fragment Test on User { id: name }'),
  ).toThrowErrorMatchingSnapshot();
});
