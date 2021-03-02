/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0a55a9b8ab73d2f9b6f68532776d5ae6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreTest1Fragment$ref: FragmentReference;
declare export opaque type RelayModernStoreTest1Fragment$fragmentType: RelayModernStoreTest1Fragment$ref;
export type RelayModernStoreTest1Fragment = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayModernStoreTest1Fragment$ref,
|};
export type RelayModernStoreTest1Fragment$data = RelayModernStoreTest1Fragment;
export type RelayModernStoreTest1Fragment$key = {
  +$data?: RelayModernStoreTest1Fragment$data,
  +$fragmentRefs: RelayModernStoreTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "size"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernStoreTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "14cbc2f0e5b6e71cb0fb47fbf726e233";
}

module.exports = node;
