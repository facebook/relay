/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d9933e944501ee8f37a1e72921d3c2ea>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTest8Fragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTest8Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest7Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest7Fragment$data = {
  readonly id?: string,
  readonly lastName?: ?string,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest8Fragment$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTest7Fragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTest7Fragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTest7Fragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest7Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest7Fragment",
  "selections": [
    {
      "kind": "InlineFragment",
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "lastName",
          "storageKey": null
        },
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentTypeRefinementTest8Fragment"
        }
      ],
      "type": "Actor",
      "abstractKey": "__isActor"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "03c0b49779e3e92b0186c5aea133afa8";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTest7Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest7Fragment$data,
>*/);
