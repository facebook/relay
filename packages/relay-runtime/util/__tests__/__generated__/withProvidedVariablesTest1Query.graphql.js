/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<140ca12b81cd2148b0d8411e420cc797>>
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
  +__pv__provideNumberOfFriends: {|
    +get: () => number,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__pv__provideNumberOfFriends": require('./../provideNumberOfFriends')
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
        "name": "__pv__provideNumberOfFriends"
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
                    "variableName": "__pv__provideNumberOfFriends"
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
    "cacheID": "efb0233a18ba050af3cd50027f3a52fd",
    "id": null,
    "metadata": {},
    "name": "withProvidedVariablesTest1Query",
    "operationKind": "query",
    "text": "query withProvidedVariablesTest1Query(\n  $__pv__provideNumberOfFriends: Int!\n) {\n  node(id: 4) {\n    __typename\n    ...withProvidedVariablesTest1Fragment\n    id\n  }\n}\n\nfragment withProvidedVariablesTest1Fragment on User {\n  friends(first: $__pv__provideNumberOfFriends) {\n    count\n  }\n}\n",
    "providedVariables": {
      "__pv__provideNumberOfFriends": require('./../provideNumberOfFriends')
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
