/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c8a8d68fece7b1bd2fc2a6f6ee4d5600>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTest6Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest5Fragment$data = {|
  +id: string,
  +lastName: ?string,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest5Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest5Fragment$data,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest5Fragment",
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
      "name": "RelayModernEnvironmentTypeRefinementTest6Fragment"
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*: any*/).hash = "96697de654c1f1d642048b41e5eaa8c7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest5Fragment$data,
>*/);
