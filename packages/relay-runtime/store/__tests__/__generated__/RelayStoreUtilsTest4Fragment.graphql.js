/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7020c6299baa1c66ba5e6f9ed44012f9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest4Fragment$ref: FragmentReference;
declare export opaque type RelayStoreUtilsTest4Fragment$fragmentType: RelayStoreUtilsTest4Fragment$ref;
export type RelayStoreUtilsTest4Fragment = {|
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayStoreUtilsTest4Fragment$ref,
|};
export type RelayStoreUtilsTest4Fragment$data = RelayStoreUtilsTest4Fragment;
export type RelayStoreUtilsTest4Fragment$key = {
  +$data?: RelayStoreUtilsTest4Fragment$data,
  +$fragmentRefs: RelayStoreUtilsTest4Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayStoreUtilsTest4Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
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
  (node/*: any*/).hash = "bc6caf25f70ed42fd0b7cacafb1c64dd";
}

module.exports = node;
