/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isRelayVariables
 * @flow
 * @format
 */

'use strict';

/**
 * Determine if the object is a plain object that matches the `Variables` type.
 */
function isRelayVariables(variables: mixed): boolean {
  return (
    typeof variables === 'object' &&
    variables !== null &&
    !Array.isArray(variables)
  );
}

module.exports = isRelayVariables;
