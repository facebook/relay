/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d82c331d0ebbc2a58c38ea4828920e09>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$ref = RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$data = {|
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor = RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$data;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor",
  "selections": [
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "128d4575c05488220a7b8d80e4fcd30e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType,
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$data,
>*/);
