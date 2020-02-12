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
const FieldHandleTransform = require('../FieldHandleTransform');
const IRPrinter = require('../../core/IRPrinter');

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
      return new CompilerContext(TestSchema)
        .addAll(definitions)
        .applyTransforms([FieldHandleTransform.transform])
        .documents()
        .map(doc => IRPrinter.print(TestSchema, doc))
        .join('\n');
    },
  );
});
