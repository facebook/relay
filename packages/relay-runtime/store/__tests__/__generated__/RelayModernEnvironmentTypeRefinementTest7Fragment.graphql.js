/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7b261873a09235cc025f1ba3c09555f0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentTypeRefinementTest8Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTest7Fragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTest7Fragment$fragmentType: RelayModernEnvironmentTypeRefinementTest7Fragment$ref;
export type RelayModernEnvironmentTypeRefinementTest7Fragment = {|
  +id?: string,
  +lastName?: ?string,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest8Fragment$ref,
  +$refType: RelayModernEnvironmentTypeRefinementTest7Fragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTest7Fragment$data = RelayModernEnvironmentTypeRefinementTest7Fragment;
export type RelayModernEnvironmentTypeRefinementTest7Fragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTest7Fragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTest7Fragment$ref,
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
  (node/*: any*/).hash = "03c0b49779e3e92b0186c5aea133afa8";
}

module.exports = node;
