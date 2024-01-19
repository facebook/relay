/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7e3f9987cb7bebba522b04632fe1f064>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryTest_node$fragmentType: FragmentType;
export type readUpdatableQueryTest_node$data = {|
  +__typename: string,
  +$fragmentType: readUpdatableQueryTest_node$fragmentType,
|};
export type readUpdatableQueryTest_node$key = {
  +$data?: readUpdatableQueryTest_node$data,
  +$fragmentSpreads: readUpdatableQueryTest_node$fragmentType,
  ...
};
*/

var node/*: any*/ = {};

if (__DEV__) {
  (node/*: any*/).hash = "1e10d6074f00480fc34548623674b3da";
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
  return value.__isreadUpdatableQueryTest_node != null ? (value/*: any*/) : false;
};
