/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a333fe9636dcfa0800f0b31edf2098b3>>
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
  (node/*: any*/).hash = "356c08c8ef540e0358e184a181394edc";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest5Fragment$data,
>*/);
