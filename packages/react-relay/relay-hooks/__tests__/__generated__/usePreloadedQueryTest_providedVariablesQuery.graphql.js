/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<44f8133e05cc96e47311baa8c702ed74>>
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
  +__usePreloadedQueryTest_providedVariablesFragment__includeName: {|
    +get: () => boolean,
  |},
  +__usePreloadedQueryTest_providedVariablesFragment__includeFirstName: {|
    +get: () => boolean,
  |},
  +__usePreloadedQueryTest_providedVariablesFragment__skipLastName: {|
    +get: () => boolean,
  |},
  +__usePreloadedQueryTest_providedVariablesFragment__skipUsername: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__usePreloadedQueryTest_providedVariablesFragment__includeName": require('./../RelayProvider_returnsTrue'),
  "__usePreloadedQueryTest_providedVariablesFragment__includeFirstName": require('./../RelayProvider_returnsFalse'),
  "__usePreloadedQueryTest_providedVariablesFragment__skipLastName": require('./../RelayProvider_returnsFalse'),
  "__usePreloadedQueryTest_providedVariablesFragment__skipUsername": require('./../RelayProvider_returnsTrue')
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
        "name": "__usePreloadedQueryTest_providedVariablesFragment__includeName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__usePreloadedQueryTest_providedVariablesFragment__includeFirstName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__usePreloadedQueryTest_providedVariablesFragment__skipLastName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__usePreloadedQueryTest_providedVariablesFragment__skipUsername"
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
                "condition": "__usePreloadedQueryTest_providedVariablesFragment__includeName",
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
                "condition": "__usePreloadedQueryTest_providedVariablesFragment__includeFirstName",
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
                "condition": "__usePreloadedQueryTest_providedVariablesFragment__skipLastName",
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
                "condition": "__usePreloadedQueryTest_providedVariablesFragment__skipUsername",
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
    "cacheID": "5ceb19084ab05ed806a5e5cf7b68f006",
    "id": null,
    "metadata": {},
    "name": "usePreloadedQueryTest_providedVariablesQuery",
    "operationKind": "query",
    "text": "query usePreloadedQueryTest_providedVariablesQuery(\n  $id: ID!\n  $__usePreloadedQueryTest_providedVariablesFragment__includeName: Boolean!\n  $__usePreloadedQueryTest_providedVariablesFragment__includeFirstName: Boolean!\n  $__usePreloadedQueryTest_providedVariablesFragment__skipLastName: Boolean!\n  $__usePreloadedQueryTest_providedVariablesFragment__skipUsername: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...usePreloadedQueryTest_providedVariablesFragment\n  }\n}\n\nfragment usePreloadedQueryTest_providedVariablesFragment on User {\n  name @include(if: $__usePreloadedQueryTest_providedVariablesFragment__includeName)\n  firstName @include(if: $__usePreloadedQueryTest_providedVariablesFragment__includeFirstName)\n  lastName @skip(if: $__usePreloadedQueryTest_providedVariablesFragment__skipLastName)\n  username @skip(if: $__usePreloadedQueryTest_providedVariablesFragment__skipUsername)\n}\n",
    "providedVariables": {
      "__usePreloadedQueryTest_providedVariablesFragment__includeName": require('./../RelayProvider_returnsTrue'),
      "__usePreloadedQueryTest_providedVariablesFragment__includeFirstName": require('./../RelayProvider_returnsFalse'),
      "__usePreloadedQueryTest_providedVariablesFragment__skipLastName": require('./../RelayProvider_returnsFalse'),
      "__usePreloadedQueryTest_providedVariablesFragment__skipUsername": require('./../RelayProvider_returnsTrue')
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
