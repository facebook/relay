/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<61e1f238a6fbfcf58082ce1c6271d1b7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTest2Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest1Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest1Fragment$data = {
  readonly id: string,
  readonly name: ?string,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest2Fragment$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTest1Fragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTest1Fragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTest1Fragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest1Fragment",
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
      "name": "name",
      "storageKey": null
    },
    {
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernEnvironmentTypeRefinementTest2Fragment"
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "56d8bec2588a9c75f03cb4774ab016e6";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTest1Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest1Fragment$data,
>*/);
