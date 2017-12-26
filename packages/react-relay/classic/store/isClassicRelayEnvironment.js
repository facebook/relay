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
 * Determine if a given value is an object that implements the `RelayEnvironment`
 * interface.
 */
function isClassicRelayEnvironment(environment: mixed): boolean {
  return (
    typeof environment === 'object' &&
    environment !== null &&
    typeof environment.applyMutation === 'function' &&
    typeof environment.sendMutation === 'function' &&
    typeof environment.forceFetch === 'function' &&
    typeof environment.getFragmentResolver === 'function' &&
    typeof environment.getStoreData === 'function' &&
    typeof environment.primeCache === 'function'
  );
}

module.exports = isClassicRelayEnvironment;
