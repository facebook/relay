/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<aac93b57e6d9a516d9792a3e33b1ded4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreTest2Fragment$ref: FragmentReference;
declare export opaque type RelayModernStoreTest2Fragment$fragmentType: RelayModernStoreTest2Fragment$ref;
export type RelayModernStoreTest2Fragment = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$refType: RelayModernStoreTest2Fragment$ref,
|};
export type RelayModernStoreTest2Fragment$data = RelayModernStoreTest2Fragment;
export type RelayModernStoreTest2Fragment$key = {
  +$data?: RelayModernStoreTest2Fragment$data,
  +$fragmentRefs: RelayModernStoreTest2Fragment$ref,
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
  "name": "RelayModernStoreTest2Fragment",
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
  (node/*: any*/).hash = "551a22e427c159d436853fa1fbed7e13";
}

module.exports = node;
