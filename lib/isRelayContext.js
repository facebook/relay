/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule isRelayContext
 * @typechecks
 * 
 */

'use strict';

/**
 * Determine if a given value is an object that implements the `RelayContext`
 * interface.
 */
function isRelayContext(context) {
  return typeof context === 'object' && context !== null && typeof context.forceFetch === 'function' && typeof context.getFragmentResolver === 'function' && typeof context.getStoreData === 'function' && typeof context.primeCache === 'function';
}

module.exports = isRelayContext;