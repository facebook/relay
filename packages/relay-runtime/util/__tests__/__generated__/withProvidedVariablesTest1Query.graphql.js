/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<18c343ab643d631441b239fffd3145cc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type withProvidedVariablesTest1Fragment$fragmentType = any;
export type withProvidedVariablesTest1Query$variables = {||};
export type withProvidedVariablesTest1QueryVariables = withProvidedVariablesTest1Query$variables;
export type withProvidedVariablesTest1Query$data = {|
  +node: ?{|
    +$fragmentSpreads: withProvidedVariablesTest1Fragment$fragmentType,
  |},
|};
export type withProvidedVariablesTest1QueryResponse = withProvidedVariablesTest1Query$data;
export type withProvidedVariablesTest1Query = {|
  variables: withProvidedVariablesTest1QueryVariables,
  response: withProvidedVariablesTest1Query$data,
|};
type ProvidedVariableProviderType = {|
  +__withProvidedVariablesTest1Fragment__numberOfFriends: {|
    +get: () => number,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__withProvidedVariablesTest1Fragment__numberOfFriends": require('./../provideNumberOfFriends')
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
    "name": "withProvidedVariablesTest1Query",
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
            "name": "withProvidedVariablesTest1Fragment"
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
        "name": "__withProvidedVariablesTest1Fragment__numberOfFriends"
      }
    ],
    "kind": "Operation",
    "name": "withProvidedVariablesTest1Query",
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
                    "variableName": "__withProvidedVariablesTest1Fragment__numberOfFriends"
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
    "cacheID": "1137b9e7190ffed3581cd3938f96744d",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest1Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest1Query(\n  $__withProvidedVariablesTest1Fragment__numberOfFriends: Int!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest1Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest1Fragment on User {\n  friends(first: $__withProvidedVariablesTest1Fragment__numberOfFriends) {\n    count\n  }\n}\n",
    "providedVariables": {
      "__withProvidedVariablesTest1Fragment__numberOfFriends": require('./../provideNumberOfFriends')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a613af5829765dd939e03fd6ff1141ff";
}

module.exports = ((node/*: any*/)/*: Query<
  withProvidedVariablesTest1Query$variables,
  withProvidedVariablesTest1Query$data,
>*/);
