/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const {
  FIXTURE_TAG,
  generateTestsFromFixtures,
} = require('./generateTestsFromFixtures');
const Matchers = require('./Matchers');
const parseGraphQLText = require('./parseGraphQLText');
const printAST = require('./printAST');
const simpleClone = require('./simpleClone');
const {TestSchema, testSchemaPath} = require('./TestSchema');
const {
  disallowWarnings,
  expectToWarn,
  expectWarningWillFire,
} = require('./warnings');
const {createMockEnvironment, unwrapContainer} = require('relay-test-utils');

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  createMockEnvironment,
  expectToWarn,
  expectWarningWillFire,
  disallowWarnings,
  FIXTURE_TAG,
  generateTestsFromFixtures,
  matchers: Matchers,
  parseGraphQLText,
  printAST,
  simpleClone,
  TestSchema,
  testSchemaPath,
  unwrapContainer,
};
