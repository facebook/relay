/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<60b24bc2cfe85a2bfcd86040b7a47cf6>>
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
export type RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$data = {
  readonly id: string,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestNestedInnerUserFragment$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestNestedUserFragment$fragmentType,
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
