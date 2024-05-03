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

const {
  FIXTURE_TAG,
  generateTestsFromFixtures,
} = require('./generateTestsFromFixtures');

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  FIXTURE_TAG,
  generateTestsFromFixtures,
};
