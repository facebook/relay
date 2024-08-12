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
  disallowConsoleErrors,
  expectConsoleError,
  expectConsoleErrorsMany,
  expectConsoleErrorWillFire,
} = require('./consoleError');
const {
  disallowConsoleWarnings,
  expectConsoleWarning,
  expectConsoleWarningsMany,
  expectConsoleWarningWillFire,
} = require('./consoleWarning');
const describeWithFeatureFlags = require('./describeWithFeatureFlags');
const {
  FIXTURE_TAG,
  generateTestsFromFixtures,
} = require('./generateTestsFromFixtures');
const Matchers = require('./Matchers');
const printAST = require('./printAST');
const simpleClone = require('./simpleClone');
const trackRetentionForEnvironment = require('./trackRetentionForEnvironment');
const {
  disallowWarnings,
  expectToWarn,
  expectToWarnMany,
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
  const matches = process.version.match(/^v(\d+)\./);
  const majorVersion = matches == null ? null : parseInt(matches[1], 10);
  if (majorVersion == null || majorVersion < 16) {
    return `Cannot read property '${propertyName}' of undefined`;
  }
  return `Cannot read properties of undefined (reading '${propertyName}')`;
}

function skipIf(condition: string | void, ...args: Array<any>) {
  const testName = args.length > 0 ? args[0] : 'N/A';
  console.warn(
    `The test "${testName}" is being skipped in open source. TODO: T192916613`,
  );
  condition === 'true' ? test.skip(...args) : test(...args);
}

/**
 * The public interface to Relay Test Utils.
 */
module.exports = {
  cannotReadPropertyOfUndefined__DEPRECATED,
  createMockEnvironment,
  describeWithFeatureFlags,
  disallowConsoleErrors,
  disallowConsoleWarnings,
  disallowWarnings,
  expectConsoleError,
  expectConsoleErrorsMany,
  expectConsoleErrorWillFire,
  expectConsoleWarningWillFire,
  expectConsoleWarning,
  expectConsoleWarningsMany,
  expectToWarn,
  expectToWarnMany,
  expectWarningWillFire,
  FIXTURE_TAG,
  generateTestsFromFixtures,
  matchers: Matchers,
  printAST,
  simpleClone,
  skipIf,
  trackRetentionForEnvironment,
  unwrapContainer,
};
