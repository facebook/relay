/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e23b8b66624dbd2e9739e34d046d3921>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernStoreTest4Fragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreTest3Fragment$ref: FragmentReference;
declare export opaque type RelayModernStoreTest3Fragment$fragmentType: RelayModernStoreTest3Fragment$ref;
export type RelayModernStoreTest3Fragment = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentRefs: RelayModernStoreTest4Fragment$ref,
  +$refType: RelayModernStoreTest3Fragment$ref,
|};
export type RelayModernStoreTest3Fragment$data = RelayModernStoreTest3Fragment;
export type RelayModernStoreTest3Fragment$key = {
  +$data?: RelayModernStoreTest3Fragment$data,
  +$fragmentRefs: RelayModernStoreTest3Fragment$ref,
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
  "name": "RelayModernStoreTest3Fragment",
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
      "args": null,
      "kind": "FragmentSpread",
      "name": "RelayModernStoreTest4Fragment"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f0b65213433460d0f0f561df0d788d31";
}

module.exports = node;
