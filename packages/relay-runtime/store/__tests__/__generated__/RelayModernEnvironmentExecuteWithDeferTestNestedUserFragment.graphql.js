/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<705a85b65367f12aa5ef759314b928ad>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$data = {|
  +id: string,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment",
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
          "name": "RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "c4051f6b233af6bcc5106d1160dac7db";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$data,
>*/);
