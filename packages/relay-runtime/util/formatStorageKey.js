/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule formatStorageKey
 * @flow
 * @format
 */

'use strict';

const forEachObject = require('forEachObject');
const stableJSONStringify = require('stableJSONStringify');

/**
 * Given a `fieldName` (eg. "foo") and an object representing arguments and
 * values (eg. `{first: 10, orberBy: "name"}`) returns a unique storage key
 * (ie. `foo{"first":10,"orderBy":"name"}`).
 */
function formatStorageKey(
  fieldName: string,
  argsWithValues: ?{[arg: string]: mixed},
): string {
  if (!argsWithValues) {
    return fieldName;
  }
  let filtered = null;
  forEachObject(argsWithValues, (value, argName) => {
    if (value != null) {
      if (!filtered) {
        filtered = {};
      }
      filtered[argName] = value;
    }
  });
  return fieldName + (filtered ? stableJSONStringify(filtered) : '');
}

module.exports = formatStorageKey;
