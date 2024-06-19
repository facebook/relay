/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 * @oncall relay
 */

'use strict';

/**
 * Creates a copy of the provided value, ensuring any nested objects have their
 * keys sorted such that equivalent values would have identical JSON.stringify
 * results.
 */
function stableCopy<T: mixed>(value: T): T {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(stableCopy);
  }
  const keys = Object.keys(value).sort();
  const stable: {[string]: mixed} = {};
  for (let i = 0; i < keys.length; i++) {
    stable[keys[i]] = stableCopy(value[keys[i]]);
  }
  return (stable: any);
}

// Detect if a data structure contains cycles. The logic here mirrors
// `stableCopy` above and is intended to detect cycles early before they get
// passed to `stableCopy` which would result in a stack overflow.
function hasCycle<T: mixed>(value: T): boolean {
  const seenObjects = new Set<mixed>();

  function hasCycleImpl(value: mixed): boolean {
    // $FlowFixMe[sketchy-null-mixed]
    if (!value || typeof value !== 'object') {
      return false;
    }
    if (seenObjects.has(value)) {
      return true;
    }
    seenObjects.add(value);

    if (Array.isArray(value)) {
      return value.some(hasCycleImpl);
    }
    return Object.values(value).some(hasCycleImpl);
  }

  return hasCycleImpl(value);
}

module.exports = {
  stableCopy,
  hasCycle,
};
