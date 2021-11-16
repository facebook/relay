/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dce9783da0df3d99144092730e91deee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest6Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest6Fragment$ref = RelayModernStoreTest6Fragment$fragmentType;
export type RelayModernStoreTest6Fragment$data = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +emailAddresses: ?$ReadOnlyArray<?string>,
  +$refType: RelayModernStoreTest6Fragment$fragmentType,
  +$fragmentType: RelayModernStoreTest6Fragment$fragmentType,
|};
export type RelayModernStoreTest6Fragment = RelayModernStoreTest6Fragment$data;
export type RelayModernStoreTest6Fragment$key = {
  +$data?: RelayModernStoreTest6Fragment$data,
  +$fragmentRefs: RelayModernStoreTest6Fragment$fragmentType,
  +$fragmentSpreads: RelayModernStoreTest6Fragment$fragmentType,
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
  "name": "RelayModernStoreTest6Fragment",
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
  (node/*: any*/).hash = "a255332c375dc670f150dad87095707a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreTest6Fragment$fragmentType,
  RelayModernStoreTest6Fragment$data,
>*/);
