/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

'use strict';

const FilterDirectivesTransform = require('../FilterDirectivesTransform');
const GraphQLCompilerContext = require('../../core/GraphQLCompilerContext');
const GraphQLIRPrinter = require('../../core/GraphQLIRPrinter');
const Schema = require('../../core/Schema');

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
      const compilerSchema = Schema.DEPRECATED__create(
        TestSchema,
        extendedSchema,
      );

      return new GraphQLCompilerContext(compilerSchema)
        .addAll(definitions)
        .applyTransforms([FilterDirectivesTransform.transform])
        .documents()
        .map(doc => GraphQLIRPrinter.print(compilerSchema, doc))
        .join('\n');
    },
  );
});
