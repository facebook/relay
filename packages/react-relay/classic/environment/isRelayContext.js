/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isRelayContext
 * @flow
 */

'use strict';

const isRelayEnvironment = require('isRelayEnvironment');
const isRelayVariables = require('isRelayVariables');

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
