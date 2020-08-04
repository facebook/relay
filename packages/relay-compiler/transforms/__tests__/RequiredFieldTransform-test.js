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

const CompilerContext = require('../../core/CompilerContext');
const IRPrinter = require('../../core/IRPrinter');
const RequiredFieldTransform = require('../RequiredFieldTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
  printAST,
} = require('relay-test-utils-internal');

describe('RequiredFieldTransform', () => {
  const extendedSchema = TestSchema.extend([
    RequiredFieldTransform.SCHEMA_EXTENSION,
  ]);
  generateTestsFromFixtures(
    `${__dirname}/fixtures/relay-required-field-transform`,
    text => {
      const {definitions} = parseGraphQLText(extendedSchema, text);
      return new CompilerContext(extendedSchema)
        .addAll(definitions)
        .applyTransforms([RequiredFieldTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(extendedSchema, doc) + printAST(doc))
        .join('\n');
    },
  );
});
