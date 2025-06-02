/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<abb48480cc0d7edcff4dadf1463c3ac6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$data = {|
  +name: ?string,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
    {
      "kind": "Defer",
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5bc0a65c0dd61e3b1be27f59fcd9bb36";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInnerUserFragment$data,
>*/);
