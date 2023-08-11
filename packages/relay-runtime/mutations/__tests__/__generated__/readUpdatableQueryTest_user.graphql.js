/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fccbd725ee99e7f119068e20b6fc19e4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryTest_user$fragmentType: FragmentType;
*/

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
