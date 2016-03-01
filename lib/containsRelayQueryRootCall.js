/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule containsRelayQueryRootCall
 * @typechecks
 * 
 */

/**
 * @internal
 *
 * Compares two query root nodes and returns true if the nodes fetched by
 * `thisRoot` would be a superset of the nodes fetched by `thatRoot`.
 */
'use strict';

function containsRelayQueryRootCall(thisRoot, thatRoot) {
  if (thisRoot === thatRoot) {
    return true;
  }
  if (getCanonicalName(thisRoot.getFieldName()) !== getCanonicalName(thatRoot.getFieldName())) {
    return false;
  }
  var thisIdentifyingArg = thisRoot.getIdentifyingArg();
  var thatIdentifyingArg = thatRoot.getIdentifyingArg();
  var thisValue = thisIdentifyingArg && thisIdentifyingArg.value || null;
  var thatValue = thatIdentifyingArg && thatIdentifyingArg.value || null;
  if (thisValue == null && thatValue == null) {
    return true;
  }
  if (thisValue == null || thatValue == null) {
    return false;
  }
  if (Array.isArray(thisValue)) {
    var thisArray = thisValue;
    if (Array.isArray(thatValue)) {
      return thatValue.every(function (eachValue) {
        return thisArray.indexOf(eachValue) >= 0;
      });
    } else {
      return thisValue.indexOf(thatValue) >= 0;
    }
  } else {
    if (Array.isArray(thatValue)) {
      return thatValue.every(function (eachValue) {
        return eachValue === thisValue;
      });
    } else {
      return thatValue === thisValue;
    }
  }
}

var canonicalRootCalls = {
  'nodes': 'node',
  'usernames': 'username'
};

/**
 * @private
 *
 * This is required to support legacy versions of GraphQL.
 */
function getCanonicalName(name) {
  if (canonicalRootCalls.hasOwnProperty(name)) {
    return canonicalRootCalls[name];
  }
  return name;
}

module.exports = containsRelayQueryRootCall;