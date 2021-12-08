/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a9b5173140948aa4ee9d8a7441b32b2e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest5Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest5Fragment$ref = RelayStoreUtilsTest5Fragment$fragmentType;
export type RelayStoreUtilsTest5Fragment$data = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayStoreUtilsTest5Fragment$fragmentType,
|};
export type RelayStoreUtilsTest5Fragment = RelayStoreUtilsTest5Fragment$data;
export type RelayStoreUtilsTest5Fragment$key = {
  +$data?: RelayStoreUtilsTest5Fragment$data,
  +$fragmentSpreads: RelayStoreUtilsTest5Fragment$fragmentType,
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
  "name": "RelayStoreUtilsTest5Fragment",
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
  (node/*: any*/).hash = "68b7f84bf2d9af3dd44f4e38ce29525f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayStoreUtilsTest5Fragment$fragmentType,
  RelayStoreUtilsTest5Fragment$data,
>*/);
