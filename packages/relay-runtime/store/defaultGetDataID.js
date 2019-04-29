/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

function defaultGetDataID(
  fieldValue: {[string]: mixed},
  typeName: string,
): mixed {
  return fieldValue.id;
}

module.exports = defaultGetDataID;
