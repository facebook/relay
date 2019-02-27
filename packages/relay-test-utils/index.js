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

const RelayModernMockEnvironment = require('./RelayModernMockEnvironment');
const RelayTestSchemaPath = require('./RelayTestSchemaPath');
const RelayTestSchema = require('./RelayTestSchema');
const RelayMockPayloadGenerator = require('./RelayMockPayloadGenerator');
const {
  generateAndCompile,
  generateTestsFromFixtures,
  generateWithTransforms,
  matchers,
  simpleClone,
  unwrapContainer,
  FIXTURE_TAG,
} = require('./RelayModernTestUtils');
const parseGraphQLText = require('./parseGraphQLText');

export type {MockResolvers} from './RelayMockPayloadGenerator';

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  MockEnvironment: RelayModernMockEnvironment,
  MockPayloadGenerator: RelayMockPayloadGenerator,
  testSchemaPath: RelayTestSchemaPath,
  TestSchema: RelayTestSchema,
  generateAndCompile,
  generateTestsFromFixtures,
  createMockEnvironment: RelayModernMockEnvironment.createMockEnvironment,
  generateWithTransforms,
  matchers,
  simpleClone,
  parseGraphQLText,
  unwrapContainer,
  FIXTURE_TAG,
};
