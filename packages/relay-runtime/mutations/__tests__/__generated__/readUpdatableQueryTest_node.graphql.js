/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fc65567424d2d12b1455889dac3b9a1e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryTest_node$fragmentType: FragmentType;
*/

var node/*: any*/ = {};

if (__DEV__) {
  (node/*:: as any*/).hash = "1e10d6074f00480fc34548623674b3da";
}

module.exports = node;

module.exports.validate = function validate(value/*: {
  +__id: string,
  +__isreadUpdatableQueryTest_node?: string,
  +$fragmentSpreads: readUpdatableQueryTest_node$fragmentType,
  ...
}*/)/*: false | {
  +__id: string,
  +__isreadUpdatableQueryTest_node: string,
  +$fragmentSpreads: readUpdatableQueryTest_node$fragmentType,
  ...
}*/ {
  return value.__isreadUpdatableQueryTest_node != null ? (value/*:: as any*/) : false;
};
