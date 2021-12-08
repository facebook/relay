/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8405ab71b717062d5d5abc4bdc85b193>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$fragmentType: FragmentType;
export type RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$ref = RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$fragmentType;
export type RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$data = {|
  +id: string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +name: ?string,
        +profile_picture: ?{|
          +uri: ?string,
        |},
      |},
    |}>,
  |},
  +$fragmentType: RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$fragmentType,
|};
export type RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment = RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$data;
export type RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$key = {
  +$data?: RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$data,
  +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "cursor"
    },
    {
      "kind": "RootArgument",
      "name": "first"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "cursor",
        "direction": "forward",
        "path": [
          "friends"
        ]
      }
    ]
  },
  "name": "RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": "friends",
      "args": null,
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "__User_friends_connection",
      "plural": false,
      "selections": [
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
                (v0/*: any*/),
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Image",
                  "kind": "LinkedField",
                  "name": "profile_picture",
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
                  "name": "__typename",
                  "storageKey": null
                }
              ],
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "cursor",
              "storageKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "concreteType": "PageInfo",
          "kind": "LinkedField",
          "name": "pageInfo",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "endCursor",
              "storageKey": null
            },
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "hasNextPage",
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
})();

if (__DEV__) {
  (node/*: any*/).hash = "3ad1b3b5a8159577804b378532ab767d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$fragmentType,
  RelayMockEnvironmentWithComponentsTestRobustAwesomenessFragment$data,
>*/);
