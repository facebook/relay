/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dc8ccf1a188f3cbeff2bf1a79a6630a7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType = any;
export type preloadQueryDEPRECATEDTest_ProvidedVarQuery$variables = {|
  id: string,
|};
export type preloadQueryDEPRECATEDTest_ProvidedVarQueryVariables = preloadQueryDEPRECATEDTest_ProvidedVarQuery$variables;
export type preloadQueryDEPRECATEDTest_ProvidedVarQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType,
  |},
|};
export type preloadQueryDEPRECATEDTest_ProvidedVarQueryResponse = preloadQueryDEPRECATEDTest_ProvidedVarQuery$data;
export type preloadQueryDEPRECATEDTest_ProvidedVarQuery = {|
  variables: preloadQueryDEPRECATEDTest_ProvidedVarQueryVariables,
  response: preloadQueryDEPRECATEDTest_ProvidedVarQuery$data,
|};
type ProvidedVariableProviderType = {|
  +__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName: {|
    +get: () => boolean,
  |},
  +__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName: {|
    +get: () => boolean,
  |},
  +__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName: {|
    +get: () => boolean,
  |},
  +__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName": require('./../RelayProvider_returnsTrue'),
  "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName": require('./../RelayProvider_returnsFalse'),
  "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName": require('./../RelayProvider_returnsFalse'),
  "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername": require('./../RelayProvider_returnsTrue')
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
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "preloadQueryDEPRECATEDTest_ProvidedVarQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "preloadQueryDEPRECATEDTest_ProvidedVarFragment"
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
        "name": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername"
      }
    ],
    "kind": "Operation",
    "name": "preloadQueryDEPRECATEDTest_ProvidedVarQuery",
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
                "condition": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName",
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
                "condition": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName",
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
                "condition": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName",
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
                "condition": "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername",
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
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "60c6c0560c52449c9c36936e67756f53",
    "id": null,
    "metadata": {},
    "name": "preloadQueryDEPRECATEDTest_ProvidedVarQuery",
    "operationKind": "query",
    "text": "query preloadQueryDEPRECATEDTest_ProvidedVarQuery(\n  $id: ID!\n  $__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName: Boolean!\n  $__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName: Boolean!\n  $__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName: Boolean!\n  $__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...preloadQueryDEPRECATEDTest_ProvidedVarFragment\n    id\n  }\n}\n\nfragment preloadQueryDEPRECATEDTest_ProvidedVarFragment on User {\n  name @include(if: $__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName)\n  firstName @include(if: $__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName)\n  lastName @skip(if: $__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName)\n  username @skip(if: $__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername)\n}\n",
    "providedVariables": {
      "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeName": require('./../RelayProvider_returnsTrue'),
      "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__includeFirstName": require('./../RelayProvider_returnsFalse'),
      "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipLastName": require('./../RelayProvider_returnsFalse'),
      "__preloadQueryDEPRECATEDTest_ProvidedVarFragment__skipUsername": require('./../RelayProvider_returnsTrue')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "949cb1280a8579bbc809976fd4ed18c6";
}

module.exports = ((node/*: any*/)/*: Query<
  preloadQueryDEPRECATEDTest_ProvidedVarQuery$variables,
  preloadQueryDEPRECATEDTest_ProvidedVarQuery$data,
>*/);
