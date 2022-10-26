/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<31e21b7fae69e2164c63bc7a2028ec5c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest3Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest3Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayStoreUtilsTest3Fragment$fragmentType,
|};
export type RelayStoreUtilsTest3Fragment$key = {
  +$data?: RelayStoreUtilsTest3Fragment$data,
  +$fragmentSpreads: RelayStoreUtilsTest3Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayStoreUtilsTest3Fragment$fragmentType,
  RelayStoreUtilsTest3Fragment$data,
>*/);
