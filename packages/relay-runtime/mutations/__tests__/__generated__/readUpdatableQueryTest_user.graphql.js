/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fcda9ce00ae0255fd368391be2c2e3ed>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryTest_user$fragmentType: FragmentType;
export type readUpdatableQueryTest_user$data = {|
  +__typename: "User",
  +$fragmentType: readUpdatableQueryTest_user$fragmentType,
|} | {|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  +__typename: "%other",
  +$fragmentType: readUpdatableQueryTest_user$fragmentType,
|};
export type readUpdatableQueryTest_user$key = {
  +$data?: readUpdatableQueryTest_user$data,
  +$fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
  ...
};
*/

var node/*: any*/ = {};

if (__DEV__) {
  (node/*: any*/).hash = "b4c3265697d01e4f38a505ed5bb58bf7";
}

module.exports = node;

module.exports.validate = function validate(value/*: {
  +__typename: string,
  +__id: string,
  +$fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
  ...
}*/)/*: false | {
  +__typename: "User",
  +__id: string,
  +$fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
  ...
}*/ {
  return value.__typename === 'User' ? (value/*: any*/) : false;
};
