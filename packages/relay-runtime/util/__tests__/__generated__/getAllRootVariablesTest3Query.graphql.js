/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8db25bf2c3fe733a2e96ebc9b46eb4f8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type getAllRootVariablesTest3Fragment$fragmentType = any;
export type getAllRootVariablesTest3Query$variables = {||};
export type getAllRootVariablesTest3QueryVariables = getAllRootVariablesTest3Query$variables;
export type getAllRootVariablesTest3Query$data = {|
  +node: ?{|
    +$fragmentSpreads: getAllRootVariablesTest3Fragment$fragmentType,
  |},
|};
export type getAllRootVariablesTest3QueryResponse = getAllRootVariablesTest3Query$data;
export type getAllRootVariablesTest3Query = {|
  variables: getAllRootVariablesTest3QueryVariables,
  response: getAllRootVariablesTest3Query$data,
|};
type ProvidedVariableProviderType = {|
  +__getAllRootVariablesTest3Fragment__numberOfFriends: {|
    +get: () => number,
  |},
  +__getAllRootVariablesTest3Fragment__includeName: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__getAllRootVariablesTest3Fragment__numberOfFriends": require('./../provideNumberOfFriends'),
  "__getAllRootVariablesTest3Fragment__includeName": require('./../provideIncludeUserNames')
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
    "name": "getAllRootVariablesTest3Query",
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
            "name": "getAllRootVariablesTest3Fragment"
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
        "name": "__getAllRootVariablesTest3Fragment__numberOfFriends"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__getAllRootVariablesTest3Fragment__includeName"
      }
    ],
    "kind": "Operation",
    "name": "getAllRootVariablesTest3Query",
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
    "cacheID": "e4f401449d420593deed5537a11c6961",
    "id": null,
    "metadata": {},
    "name": "getAllRootVariablesTest3Query",
    "operationKind": "query",
    "text": "query getAllRootVariablesTest3Query(\n  $__getAllRootVariablesTest3Fragment__numberOfFriends: Int!\n  $__getAllRootVariablesTest3Fragment__includeName: Boolean!\n) {\n  node(id: 4) {\n    __typename\n    ...getAllRootVariablesTest3Fragment\n    id\n  }\n}\n\nfragment getAllRootVariablesTest3Fragment on User {\n  name @include(if: $__getAllRootVariablesTest3Fragment__includeName)\n  friends(first: $__getAllRootVariablesTest3Fragment__numberOfFriends) {\n    count\n  }\n}\n",
    "providedVariables": {
      "__getAllRootVariablesTest3Fragment__numberOfFriends": require('./../provideNumberOfFriends'),
      "__getAllRootVariablesTest3Fragment__includeName": require('./../provideIncludeUserNames')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6e23f307fa9898404de923a07d00d708";
}

module.exports = ((node/*: any*/)/*: Query<
  getAllRootVariablesTest3Query$variables,
  getAllRootVariablesTest3Query$data,
>*/);
