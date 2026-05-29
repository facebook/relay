/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e1c61c5b4a52266fa937aa201070f0b3>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest3Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest3Fragment$data = {
  readonly profilePicture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: RelayStoreUtilsTest3Fragment$fragmentType,
};
export type RelayStoreUtilsTest3Fragment$key = {
  readonly $data?: RelayStoreUtilsTest3Fragment$data,
  readonly $fragmentSpreads: RelayStoreUtilsTest3Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "8dd490718abe2cffa2fdee2aa6bc1104";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayStoreUtilsTest3Fragment$fragmentType,
  RelayStoreUtilsTest3Fragment$data,
>*/);
