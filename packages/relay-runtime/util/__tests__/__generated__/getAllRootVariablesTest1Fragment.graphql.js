/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<968429293c7ef381d23f4e248b5dbe59>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getAllRootVariablesTest1Fragment$fragmentType: FragmentType;
export type getAllRootVariablesTest1Fragment$ref = getAllRootVariablesTest1Fragment$fragmentType;
export type getAllRootVariablesTest1Fragment$data = {|
  +friends: ?{|
    +count: ?number,
  |},
  +$fragmentType: getAllRootVariablesTest1Fragment$fragmentType,
|};
export type getAllRootVariablesTest1Fragment = getAllRootVariablesTest1Fragment$data;
export type getAllRootVariablesTest1Fragment$key = {
  +$data?: getAllRootVariablesTest1Fragment$data,
  +$fragmentSpreads: getAllRootVariablesTest1Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__getAllRootVariablesTest1Fragment__numberOfFriends"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "getAllRootVariablesTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "__getAllRootVariablesTest1Fragment__numberOfFriends"
        }
      ],
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "friends",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "count",
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
  (node/*: any*/).hash = "a74b392808c8306a7a9484c0f443cde3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getAllRootVariablesTest1Fragment$fragmentType,
  getAllRootVariablesTest1Fragment$data,
>*/);
