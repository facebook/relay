/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1b7dfbd648708633a62ed0a7fe514366>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest5Fragment$ref = RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType;
export type RelayModernEnvironmentTypeRefinementTest5Fragment$data = {|
  +id: string,
  +lastName: ?string,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest6Fragment$fragmentType,
  +$refType: RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest5Fragment = RelayModernEnvironmentTypeRefinementTest5Fragment$data;
export type RelayModernEnvironmentTypeRefinementTest5Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest5Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest5Fragment$fragmentType,
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
