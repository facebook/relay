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

// flowlint ambiguous-object-type:error

'use strict';

const InlineDataFragmentTransform = require('../InlineDataFragmentTransform');

const {CompilerContext, Printer} = require('relay-compiler');
const {
  TestSchema,
  parseGraphQLText,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

const extendedSchema = TestSchema.extend([
  InlineDataFragmentTransform.SCHEMA_EXTENSION,
]);

generateTestsFromFixtures(
  `${__dirname}/fixtures/inline-data-fragment-transform`,
  text => {
    const {definitions} = parseGraphQLText(extendedSchema, text);
    return new CompilerContext(extendedSchema)
      .addAll(definitions)
      .applyTransforms([InlineDataFragmentTransform.transform])
      .documents()
      .map(doc => Printer.print(extendedSchema, doc))
      .join('\n');
  },
);
