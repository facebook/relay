/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRecordStatusMap
 * @flow
 */

'use strict';
/**
 * Record might contain data from optimistic update.
 */
const OPTIMISTIC_MASK = 0x01;
/**
 * The subtree of data from this record contains partial data.
 */
const PARTIAL_MASK = 0x04;

function set(status: ?number, value: boolean, mask: number): number {
  status = status || 0;
  if (value) {
    return status | mask; // eslint-disable-line no-bitwise
  } else {
    return status & ~mask; // eslint-disable-line no-bitwise
  }
}

function check(status: ?number, mask: number): boolean {
  return ((status || 0) & mask) !== 0; // eslint-disable-line no-bitwise
}
/**
 * A set of functions for modifying `__status__` on records inside of
 * RelayStore.
 */
const RelayRecordStatusMap = {
  setOptimisticStatus: function(status: ?number, value: boolean): number {
    return set(status, value, OPTIMISTIC_MASK);
  },

  isOptimisticStatus: function(status: ?number): boolean {
    return check(status, OPTIMISTIC_MASK);
  },

  // Should only be used on records read out from RelayRecordStore
  // by `readRelayQueryData`.
  setPartialStatus: function(status: ?number, value: boolean): number {
    return set(status, value, PARTIAL_MASK);
  },

  isPartialStatus: function(status: ?number): boolean {
    return check(status, PARTIAL_MASK);
  },
};

module.exports = RelayRecordStatusMap;
