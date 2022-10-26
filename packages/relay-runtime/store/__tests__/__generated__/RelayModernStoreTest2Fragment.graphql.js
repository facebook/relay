/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<32b35710333f28c7c7f8d91315bea5ef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest2Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest2Fragment$data = {|
  +name: ?string,
  +profilePicture: ?{|
    +uri: ?string,
  |},
  +$fragmentType: RelayModernStoreTest2Fragment$fragmentType,
|};
export type RelayModernStoreTest2Fragment$key = {
  +$data?: RelayModernStoreTest2Fragment$data,
  +$fragmentSpreads: RelayModernStoreTest2Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreTest2Fragment$fragmentType,
  RelayModernStoreTest2Fragment$data,
>*/);
