/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<59016f1b8d41b1bb3e2b3648af1bf5c6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getAllRootVariablesTest3Fragment$fragmentType: FragmentType;
export type getAllRootVariablesTest3Fragment$ref = getAllRootVariablesTest3Fragment$fragmentType;
export type getAllRootVariablesTest3Fragment$data = {|
  +name?: ?string,
  +friends: ?{|
    +count: ?number,
  |},
  +$fragmentType: getAllRootVariablesTest3Fragment$fragmentType,
|};
export type getAllRootVariablesTest3Fragment = getAllRootVariablesTest3Fragment$data;
export type getAllRootVariablesTest3Fragment$key = {
  +$data?: getAllRootVariablesTest3Fragment$data,
  +$fragmentSpreads: getAllRootVariablesTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__getAllRootVariablesTest3Fragment__includeName"
    },
    {
      "kind": "RootArgument",
      "name": "__getAllRootVariablesTest3Fragment__numberOfFriends"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "getAllRootVariablesTest3Fragment",
  "selections": [
    {
      "condition": "__getAllRootVariablesTest3Fragment__includeName",
      "kind": "Condition",
      "passingValue": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ]
    },
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "__getAllRootVariablesTest3Fragment__numberOfFriends"
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
  (node/*: any*/).hash = "b3e261bb744f803e78fbac796f0efce0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getAllRootVariablesTest3Fragment$fragmentType,
  getAllRootVariablesTest3Fragment$data,
>*/);
