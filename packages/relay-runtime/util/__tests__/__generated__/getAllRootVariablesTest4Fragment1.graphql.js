/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<66dee697a38a93ebba233e6103cceddc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type getAllRootVariablesTest4Fragment1$fragmentType: FragmentType;
export type getAllRootVariablesTest4Fragment1$ref = getAllRootVariablesTest4Fragment1$fragmentType;
export type getAllRootVariablesTest4Fragment1$data = {|
  +friends: ?{|
    +count: ?number,
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +name?: ?string,
      |},
    |}>,
  |},
  +$fragmentType: getAllRootVariablesTest4Fragment1$fragmentType,
|};
export type getAllRootVariablesTest4Fragment1 = getAllRootVariablesTest4Fragment1$data;
export type getAllRootVariablesTest4Fragment1$key = {
  +$data?: getAllRootVariablesTest4Fragment1$data,
  +$fragmentSpreads: getAllRootVariablesTest4Fragment1$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "__getAllRootVariablesTest4Fragment1__includeName"
    },
    {
      "kind": "RootArgument",
      "name": "__getAllRootVariablesTest4Fragment1__numberOfFriends"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "getAllRootVariablesTest4Fragment1",
  "selections": [
    {
      "alias": null,
      "args": [
        {
          "kind": "Variable",
          "name": "first",
          "variableName": "__getAllRootVariablesTest4Fragment1__numberOfFriends"
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
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "FriendsEdge",
          "kind": "LinkedField",
          "name": "edges",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
                {
                  "condition": "__getAllRootVariablesTest4Fragment1__includeName",
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
                }
              ],
              "storageKey": null
            }
          ],
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
  (node/*: any*/).hash = "af081621212cc11ff2d751340762bdfd";
}

module.exports = ((node/*: any*/)/*: Fragment<
  getAllRootVariablesTest4Fragment1$fragmentType,
  getAllRootVariablesTest4Fragment1$data,
>*/);
