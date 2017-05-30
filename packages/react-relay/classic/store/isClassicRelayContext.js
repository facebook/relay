/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isClassicRelayContext
 * @flow
 * @format
 */

'use strict';

const isClassicRelayEnvironment = require('isClassicRelayEnvironment');
const isRelayVariables = require('isRelayVariables');

/**
 * Determine if a given value is an object that implements the `RelayContext`
 * interface.
 */
function isClassicRelayContext(relay: mixed): boolean {
  return (
    typeof relay === 'object' &&
    relay !== null &&
    !Array.isArray(relay) &&
    isClassicRelayEnvironment(relay.environment) &&
    isRelayVariables(relay.variables)
  );
}

module.exports = isClassicRelayContext;
