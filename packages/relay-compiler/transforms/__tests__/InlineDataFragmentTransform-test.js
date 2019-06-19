/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

const InlineDataFragmentTransform = require('../InlineDataFragmentTransform');

const {
  CompilerContext,
  Printer,
  transformASTSchema,
} = require('relay-compiler');
const {
  TestSchema,
  parseGraphQLText,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

const schema = transformASTSchema(TestSchema, [
  InlineDataFragmentTransform.SCHEMA_EXTENSION,
]);

generateTestsFromFixtures(
  `${__dirname}/fixtures/inline-data-fragment-transform`,
  text => {
    const {definitions} = parseGraphQLText(schema, text);
    return new CompilerContext(TestSchema, schema)
      .addAll(definitions)
      .applyTransforms([InlineDataFragmentTransform.transform])
      .documents()
      .map(doc => Printer.print(doc))
      .join('\n');
  },
);
