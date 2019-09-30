/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @emails oncall+relay
 * @format
 */

'use strict';

const InlineDataFragmentTransform = require('../InlineDataFragmentTransform');
const Schema = require('../../core/Schema');

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

const extendedSchema = transformASTSchema(TestSchema, [
  InlineDataFragmentTransform.SCHEMA_EXTENSION,
]);

generateTestsFromFixtures(
  `${__dirname}/fixtures/inline-data-fragment-transform`,
  text => {
    const {definitions} = parseGraphQLText(extendedSchema, text);
    const compilerSchema = Schema.DEPRECATED__create(
      TestSchema,
      extendedSchema,
    );
    return new CompilerContext(compilerSchema)
      .addAll(definitions)
      .applyTransforms([InlineDataFragmentTransform.transform])
      .documents()
      .map(doc => Printer.print(compilerSchema, doc))
      .join('\n');
  },
);
