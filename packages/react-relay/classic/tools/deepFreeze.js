/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule deepFreeze
 */

'use strict';

/**
 * Recursively "deep" freezes the supplied object.
 *
 * For convenience, and for consistency with the behavior of `Object.freeze`,
 * returns the now-frozen original object.
 */
function deepFreeze(object: Object): Object {
  Object.freeze(object);
  Object.getOwnPropertyNames(object).forEach(name => {
    const property = object[name];
    if (
      property &&
      typeof property === 'object' &&
      !Object.isFrozen(property)
    ) {
      deepFreeze(property);
    }
  });
  return object;
}

module.exports = deepFreeze;
