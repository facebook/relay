/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5f410e20e4029d19e45fd51417809e0a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest6Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest6Fragment$ref = RelayStoreUtilsTest6Fragment$fragmentType;
export type RelayStoreUtilsTest6Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayStoreUtilsTest6Fragment$fragmentType,
|};
export type RelayStoreUtilsTest6Fragment = RelayStoreUtilsTest6Fragment$data;
export type RelayStoreUtilsTest6Fragment$key = {
  +$data?: RelayStoreUtilsTest6Fragment$data,
  +$fragmentSpreads: RelayStoreUtilsTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "preset"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayStoreUtilsTest6Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "preset",
          "variableName": "preset"
        },
        {
          "kind": "Variable",
          "name": "size",
          "variableName": "size"
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
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "c9f9bb0e167b3bfd379dc6c6420d7637";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayStoreUtilsTest6Fragment$fragmentType,
  RelayStoreUtilsTest6Fragment$data,
>*/);
