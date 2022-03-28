/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b38427b612f5ca3b8b2adf01e6a06167>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryEXPERIMENTALTest_user$fragmentType: FragmentType;
*/

module.exports.validate = function validate(value/*: {
  +__typename: string,
  +__id: string,
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  ...
}*/)/*: false | {
  +__typename: "User",
  +__id: string,
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  ...
}*/ {
  return value.__typename === 'User' ? (value/*: any*/) : false;
};
