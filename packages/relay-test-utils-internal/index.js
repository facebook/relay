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

const RelayTestSchema = require('./RelayTestSchema');
const RelayTestSchemaPath = require('./RelayTestSchemaPath');

const parseGraphQLText = require('./parseGraphQLText');

const {
  generateAndCompile,
  generateTestsFromFixtures,
  generateWithTransforms,
  matchers,
  simpleClone,
  FIXTURE_TAG,
} = require('./RelayModernTestUtils');
const {createMockEnvironment, unwrapContainer} = require('relay-test-utils');

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  createMockEnvironment: createMockEnvironment,
  testSchemaPath: RelayTestSchemaPath,
  TestSchema: RelayTestSchema,
  generateAndCompile,
  generateTestsFromFixtures,
  generateWithTransforms,
  matchers,
  simpleClone,
  parseGraphQLText,
  unwrapContainer,
  FIXTURE_TAG,
};
