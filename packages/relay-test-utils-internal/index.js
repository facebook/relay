/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const Matchers = require('./Matchers');
const RelayTestSchema = require('./RelayTestSchema');
const RelayTestSchemaPath = require('./RelayTestSchemaPath');

const parseGraphQLText = require('./parseGraphQLText');
const printAST = require('./printAST');
const simpleClone = require('./simpleClone');

const {generateAndCompile, generateWithTransforms} = require('./TestCompiler');
const {
  generateTestsFromFixtures,
  FIXTURE_TAG,
} = require('./generateTestsFromFixtures');
const {createMockEnvironment, unwrapContainer} = require('relay-test-utils');

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  FIXTURE_TAG,

  TestSchema: RelayTestSchema,

  createMockEnvironment,
  generateAndCompile,
  generateTestsFromFixtures,
  generateWithTransforms,
  matchers: Matchers,
  parseGraphQLText,
  printAST,
  simpleClone,
  testSchemaPath: RelayTestSchemaPath,
  unwrapContainer,
};
