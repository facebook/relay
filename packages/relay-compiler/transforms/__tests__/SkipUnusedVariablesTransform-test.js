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
const IRPrinter = require('../../core/IRPrinter');
const Schema = require('../../core/Schema');
const SkipUnusedVariablesTransform = require('../SkipUnusedVariablesTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

generateTestsFromFixtures(
  `${__dirname}/fixtures/skip-unused-variables-transform`,
  text => {
    const {definitions} = parseGraphQLText(TestSchema, text);
    const compilerSchema = Schema.DEPRECATED__create(TestSchema);
    return new CompilerContext(compilerSchema)
      .addAll(definitions)
      .applyTransforms([SkipUnusedVariablesTransform.transform])
      .documents()
      .map(doc => IRPrinter.print(compilerSchema, doc))
      .join('\n');
  },
);
//
