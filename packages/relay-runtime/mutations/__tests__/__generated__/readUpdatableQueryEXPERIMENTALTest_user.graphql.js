/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d9a72df3c1dcb388cfc2947d80a6e220>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { FragmentType } from "relay-runtime";
declare export opaque type readUpdatableQueryEXPERIMENTALTest_user$fragmentType: FragmentType;
export type readUpdatableQueryEXPERIMENTALTest_user$ref = readUpdatableQueryEXPERIMENTALTest_user$fragmentType;
*/

module.exports.validate = function validate(value/*: {
  +__id: string,
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  +__typename: string,
  ...
}*/)/*: {
  +__id: string,
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  +__typename: "User",
  ...
} | false*/ {
  return value.__typename === 'User' ? (value/*: any*/) : false;
};
