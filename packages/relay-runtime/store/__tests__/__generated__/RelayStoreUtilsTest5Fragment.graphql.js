/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7219f2ac5d0b484bd48eabdc999d31ea>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest5Fragment$ref: FragmentReference;
declare export opaque type RelayStoreUtilsTest5Fragment$fragmentType: RelayStoreUtilsTest5Fragment$ref;
export type RelayStoreUtilsTest5Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayStoreUtilsTest5Fragment$ref,
|};
export type RelayStoreUtilsTest5Fragment$data = RelayStoreUtilsTest5Fragment;
export type RelayStoreUtilsTest5Fragment$key = {
  +$data?: RelayStoreUtilsTest5Fragment$data,
  +$fragmentRefs: RelayStoreUtilsTest5Fragment$ref,
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

module.exports = node;
