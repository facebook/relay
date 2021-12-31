/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f897d5296c0ce3cb7345d34f3ab8402b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type getAllRootVariablesTest2Fragment$fragmentType = any;
export type getAllRootVariablesTest2Query$variables = {|
  includeFriendsCount: boolean,
|};
export type getAllRootVariablesTest2QueryVariables = getAllRootVariablesTest2Query$variables;
export type getAllRootVariablesTest2Query$data = {|
  +node: ?{|
    +$fragmentSpreads: getAllRootVariablesTest2Fragment$fragmentType,
  |},
|};
export type getAllRootVariablesTest2QueryResponse = getAllRootVariablesTest2Query$data;
export type getAllRootVariablesTest2Query = {|
  variables: getAllRootVariablesTest2QueryVariables,
  response: getAllRootVariablesTest2Query$data,
|};
type ProvidedVariableProviderType = {|
  +__getAllRootVariablesTest2Fragment__numberOfFriends: {|
    +get: () => number,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__getAllRootVariablesTest2Fragment__numberOfFriends": require('./../provideNumberOfFriends')
};

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "includeFriendsCount"
},
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": 4
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "getAllRootVariablesTest2Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "includeFriendsCount_",
                "variableName": "includeFriendsCount"
              }
            ],
            "kind": "FragmentSpread",
            "name": "getAllRootVariablesTest2Fragment"
          }
        ],
        "storageKey": "node(id:4)"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v0/*: any*/),
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__getAllRootVariablesTest2Fragment__numberOfFriends"
      }
    ],
    "kind": "Operation",
    "name": "getAllRootVariablesTest2Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
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
                    "condition": "includeFriendsCount",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "node(id:4)"
      }
    ]
  },
  "params": {
    "cacheID": "a391bbe9b96949a459361fbdb12eaa6e",
    "id": null,
    "metadata": {},
    "name": "getAllRootVariablesTest2Query",
    "operationKind": "query",
    "text": "query getAllRootVariablesTest2Query(\n  $includeFriendsCount: Boolean!\n  $__getAllRootVariablesTest2Fragment__numberOfFriends: Int!\n) {\n  node(id: 4) {\n    __typename\n    ...getAllRootVariablesTest2Fragment_47ZY3u\n    id\n  }\n}\n\nfragment getAllRootVariablesTest2Fragment_47ZY3u on User {\n  friends(first: $__getAllRootVariablesTest2Fragment__numberOfFriends) {\n    count @include(if: $includeFriendsCount)\n  }\n}\n",
    "providedVariables": {
      "__getAllRootVariablesTest2Fragment__numberOfFriends": require('./../provideNumberOfFriends')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8683dcc42dd08aa9ac8210b1047d2db9";
}

module.exports = ((node/*: any*/)/*: Query<
  getAllRootVariablesTest2Query$variables,
  getAllRootVariablesTest2Query$data,
>*/);
