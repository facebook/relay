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

/**
 * Recycles subtrees from `prevData` by replacing equal subtrees in `nextData`.
 */
function recycleNodesInto<T>(prevData: T, nextData: T): T {
  if (
    prevData === nextData ||
    typeof prevData !== 'object' ||
    !prevData ||
    (prevData.constructor !== Object && !Array.isArray(prevData)) ||
    typeof nextData !== 'object' ||
    !nextData ||
    (nextData.constructor !== Object && !Array.isArray(nextData))
  ) {
    return nextData;
  }
  let canRecycle = false;

  // Assign local variables to preserve Flow type refinement.
  const prevArray: ?Array<mixed> = Array.isArray(prevData) ? prevData : null;
  const nextArray: ?Array<mixed> = Array.isArray(nextData) ? nextData : null;
  if (prevArray && nextArray) {
    canRecycle =
      nextArray.reduce((wasEqual, nextItem, ii) => {
        const prevValue = prevArray[ii];
        const nextValue = recycleNodesInto(prevValue, nextItem);
        if (nextValue !== nextArray[ii] && !Object.isFrozen(nextArray)) {
          nextArray[ii] = nextValue;
        }
        return wasEqual && nextValue === prevArray[ii];
      }, true) && prevArray.length === nextArray.length;
  } else if (!prevArray && !nextArray) {
    // Assign local variables to preserve Flow type refinement.
    const prevObject = prevData;
    const nextObject = nextData;
    const prevKeys = Object.keys(prevObject);
    const nextKeys = Object.keys(nextObject);
    canRecycle =
      nextKeys.reduce((wasEqual, key) => {
        const prevValue = prevObject[key];
        const nextValue = recycleNodesInto(prevValue, nextObject[key]);
        if (nextValue !== nextObject[key] && !Object.isFrozen(nextObject)) {
          // $FlowFixMe[cannot-write]
          nextObject[key] = nextValue;
        }
        return wasEqual && nextValue === prevObject[key];
      }, true) && prevKeys.length === nextKeys.length;
  }
  return canRecycle ? prevData : nextData;
}

module.exports = recycleNodesInto;
