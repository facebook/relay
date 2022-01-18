/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<df6398f2d588beab0999d4a77fb27b77>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type usePreloadedQueryTest_providedVariablesFragment$fragmentType = any;
export type usePreloadedQueryTest_providedVariablesQuery$variables = {|
  id: string,
|};
export type usePreloadedQueryTest_providedVariablesQueryVariables = usePreloadedQueryTest_providedVariablesQuery$variables;
export type usePreloadedQueryTest_providedVariablesQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: usePreloadedQueryTest_providedVariablesFragment$fragmentType,
  |},
|};
export type usePreloadedQueryTest_providedVariablesQueryResponse = usePreloadedQueryTest_providedVariablesQuery$data;
export type usePreloadedQueryTest_providedVariablesQuery = {|
  variables: usePreloadedQueryTest_providedVariablesQueryVariables,
  response: usePreloadedQueryTest_providedVariablesQuery$data,
|};
type ProvidedVariableProviderType = {|
  +__pv__RelayProvider_returnsTrue: {|
    +get: () => boolean,
  |},
  +__pv__RelayProvider_returnsFalse: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__pv__RelayProvider_returnsTrue": require('./../RelayProvider_returnsTrue'),
  "__pv__RelayProvider_returnsFalse": require('./../RelayProvider_returnsFalse')
};

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
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
    "argumentDefinitions": [
      (v0/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "usePreloadedQueryTest_providedVariablesQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "usePreloadedQueryTest_providedVariablesFragment"
          }
        ],
        "storageKey": null
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
        "name": "__pv__RelayProvider_returnsTrue"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__pv__RelayProvider_returnsFalse"
      }
    ],
    "kind": "Operation",
    "name": "usePreloadedQueryTest_providedVariablesQuery",
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
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "condition": "__pv__RelayProvider_returnsTrue",
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
                "condition": "__pv__RelayProvider_returnsFalse",
                "kind": "Condition",
                "passingValue": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "firstName",
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "__pv__RelayProvider_returnsFalse",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "lastName",
                    "storageKey": null
                  }
                ]
              },
              {
                "condition": "__pv__RelayProvider_returnsTrue",
                "kind": "Condition",
                "passingValue": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "username",
                    "storageKey": null
                  }
                ]
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4d62a684b434350a0586950383207568",
    "id": null,
    "metadata": {},
    "name": "usePreloadedQueryTest_providedVariablesQuery",
    "operationKind": "query",
    "text": "query usePreloadedQueryTest_providedVariablesQuery(\n  $id: ID!\n  $__pv__RelayProvider_returnsTrue: Boolean!\n  $__pv__RelayProvider_returnsFalse: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...usePreloadedQueryTest_providedVariablesFragment\n  }\n}\n\nfragment usePreloadedQueryTest_providedVariablesFragment on User {\n  name @include(if: $__pv__RelayProvider_returnsTrue)\n  firstName @include(if: $__pv__RelayProvider_returnsFalse)\n  lastName @skip(if: $__pv__RelayProvider_returnsFalse)\n  username @skip(if: $__pv__RelayProvider_returnsTrue)\n}\n",
    "providedVariables": {
      "__pv__RelayProvider_returnsTrue": require('./../RelayProvider_returnsTrue'),
      "__pv__RelayProvider_returnsFalse": require('./../RelayProvider_returnsFalse')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "323e91c95df9acb666386a24dda6b694";
}

module.exports = ((node/*: any*/)/*: Query<
  usePreloadedQueryTest_providedVariablesQuery$variables,
  usePreloadedQueryTest_providedVariablesQuery$data,
>*/);
