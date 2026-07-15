/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9e86042fae0639bfea46125b54180943>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$data = {
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType,
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
  (node/*:: as any*/).hash = "128d4575c05488220a7b8d80e4fcd30e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$fragmentType,
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestActor_actor$data,
>*/);
