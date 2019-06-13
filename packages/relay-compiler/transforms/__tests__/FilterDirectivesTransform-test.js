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

const FilterDirectivesTransform = require('../FilterDirectivesTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');

const {transformASTSchema} = require('../../core/ASTConvert');
const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('FilterDirectivesTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/filter-directives-transform`,
    text => {
      // Extend the schema with a directive for testing purposes.
      const extendedSchema = transformASTSchema(TestSchema, [
        'directive @exampleFilteredDirective on FIELD',
      ]);
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new GraphQLCompilerContext(TestSchema, extendedSchema)
        .addAll(definitions)
        .applyTransforms([FilterDirectivesTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
