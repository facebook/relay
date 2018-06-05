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

const isClassicRelayEnvironment = require('./isClassicRelayEnvironment');
const isRelayVariables = require('../environment/isRelayVariables');

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
