/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @fullSyntaxTransform
 * @format
 */

'use strict';

function find<T>(
  array: Array<T>,
  predicate: (element: T, index: number, array: Array<T>) => boolean,
  context: any,
): ?T {
  for (var ii = 0; ii < array.length; ii++) {
    if (predicate.call(context, array[ii], ii, array)) {
      return array[ii];
    }
  }
  return undefined;
}

module.exports = find;
