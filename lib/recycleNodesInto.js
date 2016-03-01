/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule recycleNodesInto
 * @typechecks
 * 
 */

'use strict';

/**
 * Recycles subtrees from `prevData` by replacing equal subtrees in `nextData`.
 */

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

function recycleNodesInto(prevData, nextData) {
  if (typeof prevData !== 'object' || !prevData || typeof nextData !== 'object' || !nextData) {
    return nextData;
  }
  var canRecycle = false;
  var isPrevArray = Array.isArray(prevData);
  var isNextArray = Array.isArray(nextData);
  if (isPrevArray && isNextArray) {
    // Assign local variables to preserve Flow type refinement.
    var prevArray = prevData;
    var nextArray = nextData;
    canRecycle = nextArray.reduce(function (wasEqual, nextItem, ii) {
      nextArray[ii] = recycleNodesInto(prevArray[ii], nextItem);
      return wasEqual && nextArray[ii] === prevArray[ii];
    }, true) && prevArray.length === nextArray.length;
  } else if (!isPrevArray && !isNextArray) {
    // Assign local variables to preserve Flow type refinement.
    var prevObject = prevData;
    var nextObject = nextData;
    var prevKeys = _Object$keys(prevObject);
    var nextKeys = _Object$keys(nextObject);
    canRecycle = nextKeys.reduce(function (wasEqual, key) {
      var nextValue = nextObject[key];
      nextObject[key] = recycleNodesInto(prevObject[key], nextValue);
      return wasEqual && nextObject[key] === prevObject[key];
    }, true) && prevKeys.length === nextKeys.length;
  }
  return canRecycle ? prevData : nextData;
}

module.exports = recycleNodesInto;