/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cd1c5c960b98d3e0d813b232da8af83f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$ref = RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data = {|
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user = RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user",
  "selections": [
    {
      "kind": "Defer",
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "04d25ce78bcd07804cf0d4b5d3114cf0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data,
>*/);
