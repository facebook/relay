/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isRelayEnvironment
 * @typechecks
 * @flow
 */

'use strict';

/**
 * Determine if a given value is an object that implements the `RelayEnvironment`
 * interface.
 */
function isRelayEnvironment(environment: mixed): boolean {
  return (
    typeof environment === 'object' &&
    environment !== null &&
    typeof environment.forceFetch === 'function' &&
    typeof environment.getFragmentResolver === 'function' &&
    typeof environment.getStoreData === 'function' &&
    typeof environment.primeCache === 'function'
  );
}

module.exports = isRelayEnvironment;
