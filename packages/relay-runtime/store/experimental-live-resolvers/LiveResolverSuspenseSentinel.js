/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 * @oncall relay
 */

'use strict';

const LIVE_RESOLVER_SUSPENSE_SENTINEL: mixed = Object.freeze({
  __LIVE_RESOLVER_SUSPENSE_SENTINEL: true,
});

function suspenseSentinel(): empty {
  // $FlowFixMe[incompatible-return]
  return LIVE_RESOLVER_SUSPENSE_SENTINEL;
}

function isSuspenseSentinel(value: mixed): boolean {
  return value === LIVE_RESOLVER_SUSPENSE_SENTINEL;
}

module.exports = {
  isSuspenseSentinel,
  suspenseSentinel,
};
