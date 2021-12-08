/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fcfc1d766da9b7bf90a0e82a9a0ff9e1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest9Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest9Fragment$ref = RelayModernStoreTest9Fragment$fragmentType;
export type RelayModernStoreTest9Fragment$data = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernStoreTest9Fragment$fragmentType,
|};
export type RelayModernStoreTest9Fragment = RelayModernStoreTest9Fragment$data;
export type RelayModernStoreTest9Fragment$key = {
  +$data?: RelayModernStoreTest9Fragment$data,
  +$fragmentSpreads: RelayModernStoreTest9Fragment$fragmentType,
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
  "name": "RelayModernStoreTest9Fragment",
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
  (node/*: any*/).hash = "c9aa05998065da656fd28fa0b154cfa1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreTest9Fragment$fragmentType,
  RelayModernStoreTest9Fragment$data,
>*/);
