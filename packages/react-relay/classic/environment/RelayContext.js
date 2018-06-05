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

const invariant = require('invariant');
const isRelayEnvironment = require('./isRelayEnvironment');
const isRelayVariables = require('./isRelayVariables');

import type {RelayContext} from 'RelayRuntime';

/**
 * Asserts that the input is a matches the `RelayContext` type defined in
 * `RelayEnvironmentTypes` and returns it as that type.
 */
function assertRelayContext(relay: mixed): RelayContext {
  invariant(
    isRelayContext(relay),
    'RelayContext: Expected `context.relay` to be an object conforming to ' +
      'the `RelayContext` interface, got `%s`.',
    relay,
  );
  return (relay: any);
}

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

module.exports = {
  assertRelayContext,
  isRelayContext,
};
