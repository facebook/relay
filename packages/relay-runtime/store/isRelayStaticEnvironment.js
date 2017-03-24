/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isRelayStaticEnvironment
 * @flow
 */

'use strict';

const RelayStaticEnvironment = require('RelayStaticEnvironment');

/**
 * Determine if a given value is an object that implements the `Environment`
 * interface defined in `RelayStoreTypes`.
 *
 * Currently the only true implementation is `RelayStaticEnvironment`, so to avoid
 * possible confusion with `RelayEnvironment` during the transition period this
 * function uses an instanceof check.
 */
function isRelayStaticEnvironment(environment: mixed): boolean {
  return environment instanceof RelayStaticEnvironment;
}

module.exports = isRelayStaticEnvironment;
