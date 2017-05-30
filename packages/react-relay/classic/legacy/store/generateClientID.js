/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule generateClientID
 * @flow
 * @format
 */

'use strict';

const crc32 = require('crc32');
const performanceNow = require('performanceNow');

let _clientID = 1;
const _prefix = 'client:' + crc32('' + performanceNow());

/**
 * Generate a unique clientID for GraphQL data objects that do not already have
 * an ID or their ID = null
 *
 * @internal
 */
function generateClientID() {
  return _prefix + _clientID++;
}

module.exports = generateClientID;
