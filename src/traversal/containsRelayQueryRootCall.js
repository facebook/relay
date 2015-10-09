/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule containsRelayQueryRootCall
 * @typechecks
 * @flow
 */

'use strict';

import type RelayQuery from 'RelayQuery';

/**
 * @internal
 *
 * Compares two query root nodes and returns true if the nodes fetched by
 * `thisRoot` would be a superset of the nodes fetched by `thatRoot`.
 */
function containsRelayQueryRootCall(
  thisRoot: RelayQuery.Root,
  thatRoot: RelayQuery.Root
): boolean {
  if (thisRoot === thatRoot) {
    return true;
  }
  if (
    getCanonicalName(thisRoot.getFieldName()) !==
    getCanonicalName(thatRoot.getFieldName())
  ) {
    return false;
  }
  const thisIdentifyingArg = thisRoot.getIdentifyingArg();
  const thatIdentifyingArg = thatRoot.getIdentifyingArg();
  const thisValue = (thisIdentifyingArg && thisIdentifyingArg.value) || null;
  const thatValue = (thatIdentifyingArg && thatIdentifyingArg.value) || null;
  if (thisValue == null && thatValue == null) {
    return true;
  }
  if (thisValue == null || thatValue == null) {
    return false;
  }
  if (Array.isArray(thisValue)) {
    var thisArray = thisValue;
    if (Array.isArray(thatValue)) {
      return thatValue.every(eachValue => thisArray.indexOf(eachValue) >= 0);
    } else {
      return thisValue.indexOf(thatValue) >= 0;
    }
  } else {
    if (Array.isArray(thatValue)) {
      return thatValue.every(eachValue => eachValue === thisValue);
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
function getCanonicalName(name: string): string {
  if (canonicalRootCalls.hasOwnProperty(name)) {
    return canonicalRootCalls[name];
  }
  return name;
}

module.exports = containsRelayQueryRootCall;
