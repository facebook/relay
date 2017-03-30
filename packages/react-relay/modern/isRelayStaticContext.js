/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isRelayStaticContext
 * @flow
 */

'use strict';

const {isRelayStaticEnvironment} = require('RelayRuntime');
const isRelayVariables = require('isRelayVariables');

/**
 * Determine if the object is a plain object that matches the `RelayContext`
 * type.
 */
function isRelayStaticContext(context: mixed): boolean {
  return (
    typeof context === 'object' &&
    context !== null &&
    !Array.isArray(context) &&
    isRelayStaticEnvironment(context.environment) &&
    isRelayVariables(context.variables)
  );
}

module.exports = isRelayStaticContext;
