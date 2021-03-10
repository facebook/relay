/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b3f3bd6d4d0de8531eaff0091fb12465>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest12Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest11Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest11Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest11Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest11Fragment = {|
  +id?: string,
  +lastName?: ?string,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest12Fragment$ref,
  +$refType: RelayModernEnvironmentTypeRefinementTest11Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest11Fragment$data = RelayModernEnvironmentTypeRefinementTest11Fragment;
export type RelayModernEnvironmentTypeRefinementTest11Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest11Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest11Fragment$ref,
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

module.exports = node;
