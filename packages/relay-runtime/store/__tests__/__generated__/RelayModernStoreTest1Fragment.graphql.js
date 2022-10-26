/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1a42e76f8a7a4bd5113c0b5a286076f6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest1Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest1Fragment$data = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernStoreTest1Fragment$fragmentType,
|};
export type RelayModernStoreTest1Fragment$key = {
  +$data?: RelayModernStoreTest1Fragment$data,
  +$fragmentSpreads: RelayModernStoreTest1Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreTest1Fragment$fragmentType,
  RelayModernStoreTest1Fragment$data,
>*/);
