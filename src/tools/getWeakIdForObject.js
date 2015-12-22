/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getWeakIdForObject
 * @flow
 * @typechecks
 */

'use strict';

const base62 = require('base62');

// Ensure non-guessable names for the id property in dev.
var KEY = '$getWeakIdForObject';
if (__DEV__) {
  KEY += base62(Math.random()).slice(2);
}

var _nextNodeID = 0;

/**
 * @internal
 *
 * Returns an ID which uniquely identifies the given `node` instance.
 */
function getWeakIdForObject(node: Object): string {
  var id = node[KEY];
  if (id == null) {
    id = base62(_nextNodeID++);
    node[KEY] = id;
  }
  return id;
}

module.exports = getWeakIdForObject;
