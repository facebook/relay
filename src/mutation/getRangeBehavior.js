/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getRangeBehavior
 * @typechecks
 * @flow
 */

'use strict';

import type {
  Call,
  RangeBehaviors,
} from 'RelayInternalTypes';

const serializeRelayQueryCall = require('serializeRelayQueryCall');

/**
 * Return the action (prepend/append) to use when adding an item to
 * the range with the specified calls.
 *
 * Ex:
 * rangeBehaviors: `{'orderby(recent)': 'append'}`
 * calls: `[{name: 'orderby', value: 'recent'}]`
 *
 * Returns `'append'`
 */
function getRangeBehavior(
  rangeBehaviors: RangeBehaviors,
  calls: Array<Call>
): ?string {
  if (typeof rangeBehaviors === 'function') {
    const rangeFilterCalls = getObjectFromCalls(calls);
    return rangeBehaviors(rangeFilterCalls); 
  } else {
    const rangeBehaviorKey = 
      calls.map(serializeRelayQueryCall).sort().join('').slice(1);
    return rangeBehaviors[rangeBehaviorKey] || null;
  }
}

/**
 * Returns an object representation of the rangeFilterCalls that
 * will be passed to config.rangeBehaviors
 * 
 * Example:
 * calls: `[{name: 'orderby', value: 'recent'}]`
 *
 * Returns:
 * `{orderby: 'recent'}`
*/
function getObjectFromCalls(
  calls: Array<Call>
): {[argName: string]: string} {
  return calls.reduce((rangeFilterCalls, call) => {
    rangeFilterCalls[call.name] = call.value;
    return rangeFilterCalls;
  },{})
}

module.exports = getRangeBehavior;
