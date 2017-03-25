/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isRelayEnvironment
 * @flow
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
    typeof environment.lookup === 'function' &&
    typeof environment.retain === 'function' &&
    typeof environment.sendQuery === 'function' &&
    typeof environment.streamQuery === 'function' &&
    typeof environment.subscribe === 'function'
  );
}

module.exports = isRelayEnvironment;
