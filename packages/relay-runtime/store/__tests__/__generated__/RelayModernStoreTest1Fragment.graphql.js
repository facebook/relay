/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4575848a700448f99d6c5e0ead3b2d58>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest1Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest1Fragment$data = {
  readonly name: ?string,
  readonly profilePicture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: RelayModernStoreTest1Fragment$fragmentType,
};
export type RelayModernStoreTest1Fragment$key = {
  readonly $data?: RelayModernStoreTest1Fragment$data,
  readonly $fragmentSpreads: RelayModernStoreTest1Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "14cbc2f0e5b6e71cb0fb47fbf726e233";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernStoreTest1Fragment$fragmentType,
  RelayModernStoreTest1Fragment$data,
>*/);
