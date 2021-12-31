/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<be95386caf9fe46638d940a7ed365945>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type getAllRootVariablesTest4Fragment1$fragmentType = any;
type getAllRootVariablesTest4Fragment2$fragmentType = any;
export type getAllRootVariablesTest4Query$variables = {||};
export type getAllRootVariablesTest4QueryVariables = getAllRootVariablesTest4Query$variables;
export type getAllRootVariablesTest4Query$data = {|
  +node: ?{|
    +$fragmentSpreads: getAllRootVariablesTest4Fragment1$fragmentType & getAllRootVariablesTest4Fragment2$fragmentType,
  |},
|};
export type getAllRootVariablesTest4QueryResponse = getAllRootVariablesTest4Query$data;
export type getAllRootVariablesTest4Query = {|
  variables: getAllRootVariablesTest4QueryVariables,
  response: getAllRootVariablesTest4Query$data,
|};
type ProvidedVariableProviderType = {|
  +__getAllRootVariablesTest4Fragment1__numberOfFriends: {|
    +get: () => number,
  |},
  +__getAllRootVariablesTest4Fragment1__includeName: {|
    +get: () => boolean,
  |},
  +__getAllRootVariablesTest4Fragment2__includeName: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__getAllRootVariablesTest4Fragment1__numberOfFriends": require('./../provideNumberOfFriends'),
  "__getAllRootVariablesTest4Fragment1__includeName": require('./../provideIncludeUserNames'),
  "__getAllRootVariablesTest4Fragment2__includeName": require('./../provideIncludeUserNames')
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
    "name": "getAllRootVariablesTest4Query",
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
            "name": "getAllRootVariablesTest4Fragment1"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "getAllRootVariablesTest4Fragment2"
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
        "name": "__getAllRootVariablesTest4Fragment1__numberOfFriends"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__getAllRootVariablesTest4Fragment1__includeName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__getAllRootVariablesTest4Fragment2__includeName"
      }
    ],
    "kind": "Operation",
    "name": "getAllRootVariablesTest4Query",
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
                "condition": "__getAllRootVariablesTest4Fragment2__includeName",
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
    "cacheID": "45928c27ca65036c95da9581f895dc4a",
    "id": null,
    "metadata": {},
    "name": "getAllRootVariablesTest4Query",
    "operationKind": "query",
    "text": "query getAllRootVariablesTest4Query(\n  $__getAllRootVariablesTest4Fragment1__numberOfFriends: Int!\n  $__getAllRootVariablesTest4Fragment1__includeName: Boolean!\n  $__getAllRootVariablesTest4Fragment2__includeName: Boolean!\n) {\n  node(id: 4) {\n    __typename\n    ...getAllRootVariablesTest4Fragment1\n    ...getAllRootVariablesTest4Fragment2\n    id\n  }\n}\n\nfragment getAllRootVariablesTest4Fragment1 on User {\n  friends(first: $__getAllRootVariablesTest4Fragment1__numberOfFriends) {\n    count\n    edges {\n      node {\n        name @include(if: $__getAllRootVariablesTest4Fragment1__includeName)\n        id\n      }\n    }\n  }\n}\n\nfragment getAllRootVariablesTest4Fragment2 on User {\n  name @include(if: $__getAllRootVariablesTest4Fragment2__includeName)\n}\n",
    "providedVariables": {
      "__getAllRootVariablesTest4Fragment1__numberOfFriends": require('./../provideNumberOfFriends'),
      "__getAllRootVariablesTest4Fragment1__includeName": require('./../provideIncludeUserNames'),
      "__getAllRootVariablesTest4Fragment2__includeName": require('./../provideIncludeUserNames')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6b66aef35ac0793174785d36f8098abf";
}

module.exports = ((node/*: any*/)/*: Query<
  getAllRootVariablesTest4Query$variables,
  getAllRootVariablesTest4Query$data,
>*/);
