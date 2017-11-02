/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const isRelayEnvironment = require('./isRelayEnvironment');
const isRelayVariables = require('./isRelayVariables');

/**
 * Determine if the input is a plain object that matches the `RelayContext`
 * type defined in `RelayEnvironmentTypes`.
 */
function isRelayContext(context: mixed): boolean {
  return (
    typeof context === 'object' &&
    context !== null &&
    !Array.isArray(context) &&
    isRelayEnvironment(context.environment) &&
    isRelayVariables(context.variables)
  );
}

module.exports = isRelayContext;
