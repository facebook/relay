/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule flattenSplitRelayQueries
 * 
 * @typechecks
 */

/**
 * Flattens the nested structure returned by `splitDeferredRelayQueries`.
 *
 * Right now our internals discard the information about the relationship
 * between the queries that is encoded in the nested structure.
 *
 * @internal
 */
'use strict';

var _toConsumableArray = require('babel-runtime/helpers/to-consumable-array')['default'];

function flattenSplitRelayQueries(splitQueries) {
  var flattenedQueries = [];
  var queue = [splitQueries];
  while (queue.length) {
    splitQueries = queue.shift();
    var _splitQueries = splitQueries;
    var required = _splitQueries.required;
    var deferred = _splitQueries.deferred;

    if (required) {
      flattenedQueries.push(required);
    }
    if (deferred.length) {
      queue.push.apply(queue, _toConsumableArray(deferred));
    }
  }
  return flattenedQueries;
}

module.exports = flattenSplitRelayQueries;