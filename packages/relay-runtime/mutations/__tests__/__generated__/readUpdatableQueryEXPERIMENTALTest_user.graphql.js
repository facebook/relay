/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<54f390e1f91118956687eaccbfd8378a>>
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
  +__id: string,
  +__typename: string,
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  ...
}*/)/*: ({
  +__id: string,
  +__typename: "User",
  +$fragmentSpreads: readUpdatableQueryEXPERIMENTALTest_user$fragmentType,
  ...
} | false)*/ {
  return value.__typename === 'User' ? (value/*: any*/) : false;
};
