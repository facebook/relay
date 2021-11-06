/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<673bbf15f01d5c05c264728ba5cc31a2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest6Fragment$ref: FragmentReference;
declare export opaque type RelayStoreUtilsTest6Fragment$fragmentType: RelayStoreUtilsTest6Fragment$ref;
export type RelayStoreUtilsTest6Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayStoreUtilsTest6Fragment$ref,
|};
export type RelayStoreUtilsTest6Fragment$data = RelayStoreUtilsTest6Fragment;
export type RelayStoreUtilsTest6Fragment$key = {
  +$data?: RelayStoreUtilsTest6Fragment$data,
  +$fragmentRefs: RelayStoreUtilsTest6Fragment$ref,
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

module.exports = node;
