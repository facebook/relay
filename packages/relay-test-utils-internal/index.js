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

const describeWithFeatureFlags = require('./describeWithFeatureFlags');
const {
  FIXTURE_TAG,
  generateTestsFromFixtures,
} = require('./generateTestsFromFixtures');
const Matchers = require('./Matchers');
const printAST = require('./printAST');
const simpleClone = require('./simpleClone');
const {
  disallowWarnings,
  expectToWarn,
  expectWarningWillFire,
} = require('./warnings');
const {createMockEnvironment, unwrapContainer} = require('relay-test-utils');

// Apparently, in node v16 (because now they are using V8 V9.something)
// the content of the TypeError has changed, and now some of our tests
// stated to fail.
// This is a temporary work-around to make test pass, but we need to
// figure out a cleaner way of testing this.
function cannotReadPropertyOfUndefined__DEPRECATED(
  propertyName: string,
): string {
  if (process.version.match(/^v16\.(.+)$/)) {
    return `Cannot read properties of undefined (reading '${propertyName}')`;
  } else {
    return `Cannot read property '${propertyName}' of undefined`;
  }
}

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  cannotReadPropertyOfUndefined__DEPRECATED,
  createMockEnvironment,
  describeWithFeatureFlags,
  expectToWarn,
  expectWarningWillFire,
  disallowWarnings,
  FIXTURE_TAG,
  generateTestsFromFixtures,
  matchers: Matchers,
  printAST,
  simpleClone,
  unwrapContainer,
};
