/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0b541ec5b8250cdfc65fa08fc52f870e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest12Fragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType: FragmentType;
export type RelayModernEnvironmentTypeRefinementTest11Fragment$ref = RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType;
export type RelayModernEnvironmentTypeRefinementTest11Fragment$data = {|
  +id?: string,
  +lastName?: ?string,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest12Fragment$fragmentType,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest12Fragment$fragmentType,
  +$refType: RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType,
  +$fragmentType: RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType,
|};
export type RelayModernEnvironmentTypeRefinementTest11Fragment = RelayModernEnvironmentTypeRefinementTest11Fragment$data;
export type RelayModernEnvironmentTypeRefinementTest11Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest11Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType,
  +$fragmentSpreads: RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTest11Fragment",
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
          "name": "RelayModernEnvironmentTypeRefinementTest12Fragment"
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
  (node/*: any*/).hash = "8bc0e3639495f2b50a1e1d136c922617";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType,
  RelayModernEnvironmentTypeRefinementTest11Fragment$data,
>*/);
