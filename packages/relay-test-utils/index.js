/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

const RelayMockPayloadGenerator = require('./RelayMockPayloadGenerator');
const RelayModernMockEnvironment = require('./RelayModernMockEnvironment');
const testResolver = require('./RelayResolverTestUtils');
const unwrapContainer = require('./unwrapContainer');

export type {MockResolvers} from './RelayMockPayloadGenerator';
export type {RelayMockEnvironment} from './RelayModernMockEnvironment';

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  MockEnvironment: RelayModernMockEnvironment,
  MockPayloadGenerator: RelayMockPayloadGenerator,
  createMockEnvironment: RelayModernMockEnvironment.createMockEnvironment,
  unwrapContainer: unwrapContainer,
  testResolver: testResolver,
};
