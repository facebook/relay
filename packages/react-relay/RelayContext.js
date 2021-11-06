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

import type {RelayContext} from 'relay-runtime';

const isRelayEnvironment = require('./isRelayEnvironment');
const invariant = require('invariant');

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
    isRelayEnvironment(context.environment)
  );
}

module.exports = {
  assertRelayContext,
  isRelayContext,
};
