/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<09c5d0141a63dde225a5a097e5db40fe>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTest10Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest9Fragment$data = {
  readonly id: string,
  readonly lastName: ?string,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest10Fragment$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTest9Fragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTest9Fragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest9Fragment",
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
      "name": "RelayModernEnvironmentTypeRefinementTest10Fragment"
    }
  ],
  "type": "Actor",
  "abstractKey": "__isActor"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "eb358a93c13d1baeb0a769c284f8b440";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTest9Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest9Fragment$data,
>*/);
