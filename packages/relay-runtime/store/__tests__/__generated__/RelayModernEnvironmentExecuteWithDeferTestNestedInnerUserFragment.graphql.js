/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<04c17d2b5e4b6685e84c65d7d95f8e66>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$data = {|
  +name: ?string,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment",
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
          "name": "RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "5286c825004180b1a4eeac0e404602c4";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$data,
>*/);
