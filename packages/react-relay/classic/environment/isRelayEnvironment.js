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

/**
 * Determine if a given value is an object that implements the `Environment`
 * interface defined in `RelayEnvironmentTypes`.
 */
function isRelayEnvironment(environment: mixed): boolean {
  return (
    typeof environment === 'object' &&
    environment !== null &&
    // TODO: add applyMutation/sendMutation once ready in both cores
    typeof environment.check === 'function' &&
    typeof environment.lookup === 'function' &&
    typeof environment.retain === 'function' &&
    typeof environment.sendQuery === 'function' &&
    typeof environment.execute === 'function' &&
    typeof environment.subscribe === 'function'
  );
}

module.exports = isRelayEnvironment;
