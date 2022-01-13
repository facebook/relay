/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<68a09fdacaea8df327dba334285cdafa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type withProvidedVariablesTest2Fragment$fragmentType = any;
export type withProvidedVariablesTest2Query$variables = {|
  includeFriendsCount: boolean,
|};
export type withProvidedVariablesTest2QueryVariables = withProvidedVariablesTest2Query$variables;
export type withProvidedVariablesTest2Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest2Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest2QueryResponse = withProvidedVariablesTest2Query$data;
export type withProvidedVariablesTest2Query = {|
  variables: withProvidedVariablesTest2QueryVariables,
  response: withProvidedVariablesTest2Query$data,
|};
type ProvidedVariableProviderType = {|
  +__withProvidedVariablesTest2Fragment__numberOfFriends: {|
    +get: () => number,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__withProvidedVariablesTest2Fragment__numberOfFriends": require('./../provideNumberOfFriends')
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
    "name": "withProvidedVariablesTest2Query",
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
            "name": "withProvidedVariablesTest2Fragment"
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
        "name": "__withProvidedVariablesTest2Fragment__numberOfFriends"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest2Query",
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
                    "variableName": "__withProvidedVariablesTest2Fragment__numberOfFriends"
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
    "cacheID": "e62bd7ee18b8ecb0bbfe2aefea9f0e85",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest2Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest2Query(\n  $includeFriendsCount: Boolean!\n  $__withProvidedVariablesTest2Fragment__numberOfFriends: Int!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest2Fragment_47ZY3u\n    id\n  }\n}\n\nfragment withProvidedVariablesTest2Fragment_47ZY3u on User {\n  friends(first: $__withProvidedVariablesTest2Fragment__numberOfFriends) {\n    count @include(if: $includeFriendsCount)\n  }\n}\n",
    "providedVariables": {
      "__withProvidedVariablesTest2Fragment__numberOfFriends": require('./../provideNumberOfFriends')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e9e93574d0f69b01f4abac7b2738cece";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest2Query$variables,
  withProvidedVariablesTest2Query$data,
>*/);
