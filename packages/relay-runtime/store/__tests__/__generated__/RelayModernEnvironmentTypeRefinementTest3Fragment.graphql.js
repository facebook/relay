/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<045817c5f8ef8af6ccc001f3a51d407a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType } from "./RelayModernEnvironmentTypeRefinementTest4Fragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest3Fragment$data = {
  readonly id: string,
  readonly lastName: ?string,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest4Fragment$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType,
};
export type RelayModernEnvironmentTypeRefinementTest3Fragment$key = {
  readonly $data?: RelayModernEnvironmentTypeRefinementTest3Fragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest3Fragment",
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
      "name": "RelayModernEnvironmentTypeRefinementTest4Fragment"
    }
  ],
  "type": "Page",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "f0bb895c71278e149eba4c305ca1cfcf";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentTypeRefinementTest3Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest3Fragment$data,
>*/);
