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

const isRelayVariables = require('../classic/environment/isRelayVariables');

const {isRelayModernEnvironment} = require('RelayRuntime');

/**
 * Determine if the object is a plain object that matches the `RelayContext`
 * type.
 */
function isRelayModernContext(context: mixed): boolean {
  return (
    typeof context === 'object' &&
    context !== null &&
    !Array.isArray(context) &&
    isRelayModernEnvironment(context.environment) &&
    isRelayVariables(context.variables)
  );
}

module.exports = isRelayModernContext;
