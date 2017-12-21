/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const invariant = require('invariant');
const serializeRelayQueryCall = require('../query/serializeRelayQueryCall');

import type {Call, CallValue} from '../tools/RelayInternalTypes';
import type {RangeBehaviors} from 'RelayDeclarativeMutationConfig';

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
  calls: Array<Call>,
): ?string {
  if (typeof rangeBehaviors === 'function') {
    const rangeFilterCalls = getObjectFromCalls(calls);
    return rangeBehaviors(rangeFilterCalls);
  } else {
    const rangeBehaviorKey = calls
      .map(serializeRelayQueryCall)
      .sort()
      .join('')
      .slice(1);
    const behavior = rangeBehaviors[rangeBehaviorKey];
    if (behavior == null) {
      return null;
    }
    invariant(
      typeof behavior === 'string',
      'getRangeBehavior(): Expected range behavior for key `%s` to be a ' +
        'string, got `%s`.',
      rangeBehaviorKey,
      behavior,
    );
    return behavior;
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
  calls: Array<Call>,
): {[argName: string]: CallValue} {
  const behaviors: {[argName: string]: CallValue} = {};
  calls.forEach(call => {
    behaviors[call.name] = call.value;
  });
  return behaviors;
}

module.exports = getRangeBehavior;
