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

const CompilerContext = require('../../core/CompilerContext');
const FieldHandleTransform = require('../FieldHandleTransform');
const IRPrinter = require('../../core/IRPrinter');
const Schema = require('../../core/Schema');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('FieldHandleTransform', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/field-handle-transform`,
    text => {
      const {definitions} = parseGraphQLText(TestSchema, text);
      const compilerSchema = Schema.DEPRECATED__create(TestSchema);
      return new CompilerContext(compilerSchema)
        .addAll(definitions)
        .applyTransforms([FieldHandleTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(compilerSchema, doc))
        .join('\n');
    },
  );
});
