/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ca2c36096b56374d4748cb19efa61916>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getAllRootVariablesTest2Fragment$fragmentType: FragmentType;
export type getAllRootVariablesTest2Fragment$ref = getAllRootVariablesTest2Fragment$fragmentType;
export type getAllRootVariablesTest2Fragment$data = {|
  +friends: ?{|
    +count?: ?number,
  |},
  +$fragmentType: getAllRootVariablesTest2Fragment$fragmentType,
|};
export type getAllRootVariablesTest2Fragment = getAllRootVariablesTest2Fragment$data;
export type getAllRootVariablesTest2Fragment$key = {
  +$data?: getAllRootVariablesTest2Fragment$data,
  +$fragmentSpreads: getAllRootVariablesTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__getAllRootVariablesTest2Fragment__numberOfFriends"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "includeFriendsCount_"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "getAllRootVariablesTest2Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "__getAllRootVariablesTest2Fragment__numberOfFriends"
        }
      ],
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "friends",
      "plural": false,
      "selections": [
        {
          "condition": "includeFriendsCount_",
          "kind": "Condition",
          "passingValue": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "count",
              "storageKey": null
            }
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "7b953b01b9a56748f518c7cc03f957db";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getAllRootVariablesTest2Fragment$fragmentType,
  getAllRootVariablesTest2Fragment$data,
>*/);
