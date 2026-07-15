/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e12321e45ef125aa2cfd85a682cc3c1e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryTest_user$fragmentType: FragmentType;
*/

var node/*: any*/ = {};

if (__DEV__) {
  (node/*:: as any*/).hash = "b4c3265697d01e4f38a505ed5bb58bf7";
}

module.exports = node;

module.exports.validate = function validate(value/*: {
  readonly __typename: string,
  readonly __id: string,
  readonly $fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
  ...
}*/)/*: false | {
  readonly __typename: "User",
  readonly __id: string,
  readonly $fragmentSpreads: readUpdatableQueryTest_user$fragmentType,
  ...
}*/ {
  return value.__typename === 'User' ? (value/*:: as any*/) : false;
};
