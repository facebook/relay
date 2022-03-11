/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<94f283d23c1d83430bf3dee2d9bbd1df>>
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
}*/)/*: {
  +__typename: "User",
  +__id: string,
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  ...
} | false*/ {
  return value.__typename === 'User' ? (value/*: any*/) : false;
};
