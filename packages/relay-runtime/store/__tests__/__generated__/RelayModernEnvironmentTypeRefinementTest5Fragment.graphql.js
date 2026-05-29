/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<80a25f6e713c9aedd166fbed946354b6>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTest6Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest5Fragment$data = {
  readonly id: string,
  readonly lastName: ?string,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTest5Fragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTest5Fragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "356c08c8ef540e0358e184a181394edc";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest5Fragment$data,
>*/);
