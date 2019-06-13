/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const RefineOperationVariablesTransform = require('../RefineOperationVariablesTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('RefineOperationVariablesTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/refine-operation-variables-transform`,
    text => {
      const {definitions} = parseGraphQLText(TestSchema, text);
      return new GraphQLCompilerContext(TestSchema)
        .addAll(definitions)
        .applyTransforms([
          RefineOperationVariablesTransform.transformWithOptions({
            removeUnusedVariables: true,
          }),
        ])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
