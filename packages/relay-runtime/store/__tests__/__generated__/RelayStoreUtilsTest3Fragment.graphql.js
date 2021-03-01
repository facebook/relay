/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e07299b02c9b669c6f5b4ff0e8307ab3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest3Fragment$ref: FragmentReference;
declare export opaque type RelayStoreUtilsTest3Fragment$fragmentType: RelayStoreUtilsTest3Fragment$ref;
export type RelayStoreUtilsTest3Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayStoreUtilsTest3Fragment$ref,
|};
export type RelayStoreUtilsTest3Fragment$data = RelayStoreUtilsTest3Fragment;
export type RelayStoreUtilsTest3Fragment$key = {
  +$data?: RelayStoreUtilsTest3Fragment$data,
  +$fragmentRefs: RelayStoreUtilsTest3Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayStoreUtilsTest3Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "size",
          "value": 128
        }
      ],
      "concreteType": "Image",
      "kind": "LinkedField",
      "name": "profilePicture",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "uri",
          "storageKey": null
        }
      ],
      "storageKey": "profilePicture(size:128)"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8dd490718abe2cffa2fdee2aa6bc1104";
}

module.exports = node;
