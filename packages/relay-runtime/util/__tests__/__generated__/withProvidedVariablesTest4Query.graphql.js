/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<65f46990b470fd997f62def73de4446b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type withProvidedVariablesTest4Fragment1$fragmentType = any;
type withProvidedVariablesTest4Fragment2$fragmentType = any;
export type withProvidedVariablesTest4Query$variables = {||};
export type withProvidedVariablesTest4QueryVariables = withProvidedVariablesTest4Query$variables;
export type withProvidedVariablesTest4Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest4Fragment1$fragmentType & withProvidedVariablesTest4Fragment2$fragmentType,
  |},
|};
export type withProvidedVariablesTest4QueryResponse = withProvidedVariablesTest4Query$data;
export type withProvidedVariablesTest4Query = {|
  variables: withProvidedVariablesTest4QueryVariables,
  response: withProvidedVariablesTest4Query$data,
|};
type ProvidedVariableProviderType = {|
  +__withProvidedVariablesTest4Fragment1__numberOfFriends: {|
    +get: () => number,
  |},
  +__withProvidedVariablesTest4Fragment1__includeName: {|
    +get: () => boolean,
  |},
  +__withProvidedVariablesTest4Fragment2__includeName: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__withProvidedVariablesTest4Fragment1__numberOfFriends": require('./../provideNumberOfFriends'),
  "__withProvidedVariablesTest4Fragment1__includeName": require('./../provideIncludeUserNames'),
  "__withProvidedVariablesTest4Fragment2__includeName": require('./../provideIncludeUserNames')
};

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": 4
  }
],
v1 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "withProvidedVariablesTest4Query",
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
            "name": "withProvidedVariablesTest4Fragment1"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "withProvidedVariablesTest4Fragment2"
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
        "name": "__withProvidedVariablesTest4Fragment1__numberOfFriends"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__withProvidedVariablesTest4Fragment1__includeName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__withProvidedVariablesTest4Fragment2__includeName"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest4Query",
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
                    "variableName": "__withProvidedVariablesTest4Fragment1__numberOfFriends"
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
                            "condition": "__withProvidedVariablesTest4Fragment1__includeName",
                            "kind": "Condition",
                            "passingValue": true,
                            "selections": (v1/*: any*/)
                          },
                          (v2/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "condition": "__withProvidedVariablesTest4Fragment2__includeName",
                "kind": "Condition",
                "passingValue": true,
                "selections": (v1/*: any*/)
              }
            ],
            "type": "User",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": "node(id:4)"
      }
    ]
  },
  "params": {
    "cacheID": "036aaa78327f973e8cfdcb771252a44e",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest4Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest4Query(\n  $__withProvidedVariablesTest4Fragment1__numberOfFriends: Int!\n  $__withProvidedVariablesTest4Fragment1__includeName: Boolean!\n  $__withProvidedVariablesTest4Fragment2__includeName: Boolean!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest4Fragment1\n    ...withProvidedVariablesTest4Fragment2\n    id\n  }\n}\n\nfragment withProvidedVariablesTest4Fragment1 on User {\n  friends(first: $__withProvidedVariablesTest4Fragment1__numberOfFriends) {\n    count\n    edges {\n      node {\n        name @include(if: $__withProvidedVariablesTest4Fragment1__includeName)\n        id\n      }\n    }\n  }\n}\n\nfragment withProvidedVariablesTest4Fragment2 on User {\n  name @include(if: $__withProvidedVariablesTest4Fragment2__includeName)\n}\n",
    "providedVariables": {
      "__withProvidedVariablesTest4Fragment1__numberOfFriends": require('./../provideNumberOfFriends'),
      "__withProvidedVariablesTest4Fragment1__includeName": require('./../provideIncludeUserNames'),
      "__withProvidedVariablesTest4Fragment2__includeName": require('./../provideIncludeUserNames')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "08096779ec00305df9771824e002669c";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest4Query$variables,
  withProvidedVariablesTest4Query$data,
>*/);
