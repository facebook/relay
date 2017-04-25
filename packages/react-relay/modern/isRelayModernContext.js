/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isRelayModernContext
 * @flow
 */

'use strict';

const isRelayVariables = require('isRelayVariables');

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
