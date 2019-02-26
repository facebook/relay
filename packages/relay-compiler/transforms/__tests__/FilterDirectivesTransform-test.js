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
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {transformASTSchema} = require('../../core/ASTConvert');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('FilterDirectivesTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/filter-directives-transform`,
    text => {
      // Extend the schema with a directive for testing purposes.
      const extendedSchema = transformASTSchema(RelayTestSchema, [
        'directive @exampleFilteredDirective on FIELD',
      ]);
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new GraphQLCompilerContext(RelayTestSchema, extendedSchema)
        .addAll(definitions)
        .applyTransforms([FilterDirectivesTransform.transform])
        .documents()
        .map(GraphQLIRPrinter.print)
        .join('\n');
    },
  );
});
