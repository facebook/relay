/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails
 * @format
 * @emails oncall+relay
 */

'use strict';

const RelayValidator = require('RelayValidator');
const GraphQL = require('graphql');
const RelayTestSchema = require('RelayTestSchema');

function validateString(input) {
  const ast = GraphQL.parse(new GraphQL.Source(input, 'test.graphql'));
  return () => {
    RelayValidator.validate(ast, RelayTestSchema, RelayValidator.LOCAL_RULES);
  };
}

test('non-scalar leaf', () => {
  expect(
    validateString('fragment Test on User { friends }'),
  ).toThrowErrorMatchingSnapshot();
});

test('id alias validation', () => {
  expect(validateString('fragment Test on User { id }')).not.toThrow();

  expect(validateString('fragment Test on User { id: id }')).not.toThrow();

  expect(
    validateString('fragment Test on User { id: name }'),
  ).toThrowErrorMatchingSnapshot();
});
