/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<78b9f62ff44888cdbdc9b146ce206a73>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type withProvidedVariablesTest3Fragment$fragmentType = any;
export type withProvidedVariablesTest3Query$variables = {||};
export type withProvidedVariablesTest3QueryVariables = withProvidedVariablesTest3Query$variables;
export type withProvidedVariablesTest3Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest3Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest3QueryResponse = withProvidedVariablesTest3Query$data;
export type withProvidedVariablesTest3Query = {|
  variables: withProvidedVariablesTest3QueryVariables,
  response: withProvidedVariablesTest3Query$data,
|};
type ProvidedVariableProviderType = {|
  +__withProvidedVariablesTest3Fragment__numberOfFriends: {|
    +get: () => number,
  |},
  +__withProvidedVariablesTest3Fragment__includeName: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__withProvidedVariablesTest3Fragment__numberOfFriends": require('./../provideNumberOfFriends'),
  "__withProvidedVariablesTest3Fragment__includeName": require('./../provideIncludeUserNames')
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
    "name": "withProvidedVariablesTest3Query",
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
            "name": "withProvidedVariablesTest3Fragment"
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
        "name": "__withProvidedVariablesTest3Fragment__numberOfFriends"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__withProvidedVariablesTest3Fragment__includeName"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest3Query",
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
                "condition": "__withProvidedVariablesTest3Fragment__includeName",
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
                    "variableName": "__withProvidedVariablesTest3Fragment__numberOfFriends"
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
    "cacheID": "073a44ea3e75c042836862c6d278e0d9",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest3Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest3Query(\n  $__withProvidedVariablesTest3Fragment__numberOfFriends: Int!\n  $__withProvidedVariablesTest3Fragment__includeName: Boolean!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest3Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest3Fragment on User {\n  name @include(if: $__withProvidedVariablesTest3Fragment__includeName)\n  friends(first: $__withProvidedVariablesTest3Fragment__numberOfFriends) {\n    count\n  }\n}\n",
    "providedVariables": {
      "__withProvidedVariablesTest3Fragment__numberOfFriends": require('./../provideNumberOfFriends'),
      "__withProvidedVariablesTest3Fragment__includeName": require('./../provideIncludeUserNames')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a0300c848560c03d4f2d7662ab5d27d3";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest3Query$variables,
  withProvidedVariablesTest3Query$data,
>*/);
