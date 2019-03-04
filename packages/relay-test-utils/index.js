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

const RelayMockPayloadGenerator = require('./RelayMockPayloadGenerator');
const RelayModernMockEnvironment = require('./RelayModernMockEnvironment');
const RelayTestSchema = require('./RelayTestSchema');
const RelayTestSchemaPath = require('./RelayTestSchemaPath');

const parseGraphQLText = require('./parseGraphQLText');

const {
  generateAndCompile,
  generateTestsFromFixtures,
  generateWithTransforms,
  matchers,
  simpleClone,
  unwrapContainer,
  FIXTURE_TAG,
} = require('./RelayModernTestUtils');

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
