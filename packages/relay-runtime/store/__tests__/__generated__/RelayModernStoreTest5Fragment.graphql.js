/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5debcc7c8f1c9fbd65641bc22406bb6c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreTest5Fragment$ref: FragmentReference;
declare export opaque type RelayModernStoreTest5Fragment$fragmentType: RelayModernStoreTest5Fragment$ref;
export type RelayModernStoreTest5Fragment = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string
  |},
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +$refType: RelayModernStoreTest5Fragment$ref,
|};
export type RelayModernStoreTest5Fragment$data = RelayModernStoreTest5Fragment;
export type RelayModernStoreTest5Fragment$key = {
  +$data?: RelayModernStoreTest5Fragment$data,
  +$fragmentRefs: RelayModernStoreTest5Fragment$ref,
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
  "name": "RelayModernStoreTest5Fragment",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "emailAddresses",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "bafa0effa0e5f104fada10c8e21b490a";
}

module.exports = node;
