/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<87fc263ce85a725a19ce73b30df01401>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$data = {|
  +id: string,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "Defer",
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "e6803e7a0a81e2b0acd328649b47099a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$fragmentType,
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedQuery_user$data,
>*/);
