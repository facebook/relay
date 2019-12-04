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

// flowlint ambiguous-object-type:error

'use strict';

const CompilerContext = require('../../core/CompilerContext');
const FilterDirectivesTransform = require('../FilterDirectivesTransform');
const IRPrinter = require('../../core/IRPrinter');

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
      const extendedSchema = TestSchema.extend([
        'directive @exampleFilteredDirective on FIELD',
      ]);
      const {definitions} = parseGraphQLText(extendedSchema, text);

      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([FilterDirectivesTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc))
        .join('\n');
    },
  );
});
