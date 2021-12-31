/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8b35407a71fde3ca5bcb72891a90894f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type getAllRootVariablesTest1Fragment$fragmentType = any;
export type getAllRootVariablesTest1Query$variables = {||};
export type getAllRootVariablesTest1QueryVariables = getAllRootVariablesTest1Query$variables;
export type getAllRootVariablesTest1Query$data = {|
  +node: ?{|
    +$fragmentSpreads: getAllRootVariablesTest1Fragment$fragmentType,
  |},
|};
export type getAllRootVariablesTest1QueryResponse = getAllRootVariablesTest1Query$data;
export type getAllRootVariablesTest1Query = {|
  variables: getAllRootVariablesTest1QueryVariables,
  response: getAllRootVariablesTest1Query$data,
|};
type ProvidedVariableProviderType = {|
  +__getAllRootVariablesTest1Fragment__numberOfFriends: {|
    +get: () => number,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__getAllRootVariablesTest1Fragment__numberOfFriends": require('./../provideNumberOfFriends')
};

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": 4
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "getAllRootVariablesTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "getAllRootVariablesTest1Fragment"
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
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__getAllRootVariablesTest1Fragment__numberOfFriends"
      }
    ],
    "kind": "Operation",
    "name": "getAllRootVariablesTest1Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
    "cacheID": "32bcfbb2c2fdb633c92e6be3f3a7da17",
    "id": null,
    "metadata": {},
    "name": "getAllRootVariablesTest1Query",
    "operationKind": "query",
    "text": "query getAllRootVariablesTest1Query(\n  $__getAllRootVariablesTest1Fragment__numberOfFriends: Int!\n) {\n  node(id: 4) {\n    __typename\n    ...getAllRootVariablesTest1Fragment\n    id\n  }\n}\n\nfragment getAllRootVariablesTest1Fragment on User {\n  friends(first: $__getAllRootVariablesTest1Fragment__numberOfFriends) {\n    count\n  }\n}\n",
    "providedVariables": {
      "__getAllRootVariablesTest1Fragment__numberOfFriends": require('./../provideNumberOfFriends')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "26942bace8b90e4ad21ec1e538a53c49";
}

module.exports = ((node/*: any*/)/*: Query<
  getAllRootVariablesTest1Query$variables,
  getAllRootVariablesTest1Query$data,
>*/);
