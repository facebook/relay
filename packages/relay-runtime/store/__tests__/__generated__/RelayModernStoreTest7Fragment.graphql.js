/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dc485a583ee3953f6cb52d04da76fe0c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest7Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest7Fragment$data = {
  readonly name: ?string,
  readonly profilePicture: ?{
    readonly uri: ?string,
  },
  readonly $fragmentType: RelayModernStoreTest7Fragment$fragmentType,
};
export type RelayModernStoreTest7Fragment$key = {
  readonly $data?: RelayModernStoreTest7Fragment$data,
  readonly $fragmentSpreads: RelayModernStoreTest7Fragment$fragmentType,
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
  "name": "RelayModernStoreTest7Fragment",
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
  (node/*:: as any*/).hash = "ca81038ceb34f4d6f3e512a3b6a21712";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernStoreTest7Fragment$fragmentType,
  RelayModernStoreTest7Fragment$data,
>*/);
