/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @fullSyntaxTransform
 * @format
 */

'use strict';

function find<T>(
  array: $ReadOnlyArray<T>,
  predicate: (element: T, index: number, array: $ReadOnlyArray<T>) => boolean,
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
