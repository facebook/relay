/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c3cdad8d07f0ed3230794f9b7f541491>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayResponseNormalizerTest_pvFragment$fragmentType = any;
export type RelayResponseNormalizerTest_pvQuery$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest_pvQueryVariables = RelayResponseNormalizerTest_pvQuery$variables;
export type RelayResponseNormalizerTest_pvQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayResponseNormalizerTest_pvFragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest_pvQueryResponse = RelayResponseNormalizerTest_pvQuery$data;
export type RelayResponseNormalizerTest_pvQuery = {|
  variables: RelayResponseNormalizerTest_pvQueryVariables,
  response: RelayResponseNormalizerTest_pvQuery$data,
|};
type ProvidedVariableProviderType = {|
  +__RelayResponseNormalizerTest_pvFragment__includeName: {|
    +get: () => boolean,
  |},
  +__RelayResponseNormalizerTest_pvFragment__includeFirstName: {|
    +get: () => boolean,
  |},
  +__RelayResponseNormalizerTest_pvFragment__skipLastName: {|
    +get: () => boolean,
  |},
  +__RelayResponseNormalizerTest_pvFragment__skipUsername: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__RelayResponseNormalizerTest_pvFragment__includeName": require('./../RelayProvider_returnsTrue'),
  "__RelayResponseNormalizerTest_pvFragment__includeFirstName": require('./../RelayProvider_returnsFalse'),
  "__RelayResponseNormalizerTest_pvFragment__skipLastName": require('./../RelayProvider_returnsFalse'),
  "__RelayResponseNormalizerTest_pvFragment__skipUsername": require('./../RelayProvider_returnsTrue')
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
    "name": "RelayResponseNormalizerTest_pvQuery",
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
            "name": "RelayResponseNormalizerTest_pvFragment"
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
        "name": "__RelayResponseNormalizerTest_pvFragment__includeName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__RelayResponseNormalizerTest_pvFragment__includeFirstName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__RelayResponseNormalizerTest_pvFragment__skipLastName"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__RelayResponseNormalizerTest_pvFragment__skipUsername"
      }
    ],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest_pvQuery",
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
                "condition": "__RelayResponseNormalizerTest_pvFragment__includeName",
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
                "condition": "__RelayResponseNormalizerTest_pvFragment__includeFirstName",
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
                "condition": "__RelayResponseNormalizerTest_pvFragment__skipLastName",
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
                "condition": "__RelayResponseNormalizerTest_pvFragment__skipUsername",
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
    "cacheID": "e5244df351ec7c418a4e2311541dd355",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest_pvQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest_pvQuery(\n  $id: ID!\n  $__RelayResponseNormalizerTest_pvFragment__includeName: Boolean!\n  $__RelayResponseNormalizerTest_pvFragment__includeFirstName: Boolean!\n  $__RelayResponseNormalizerTest_pvFragment__skipLastName: Boolean!\n  $__RelayResponseNormalizerTest_pvFragment__skipUsername: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayResponseNormalizerTest_pvFragment\n  }\n}\n\nfragment RelayResponseNormalizerTest_pvFragment on User {\n  name @include(if: $__RelayResponseNormalizerTest_pvFragment__includeName)\n  firstName @include(if: $__RelayResponseNormalizerTest_pvFragment__includeFirstName)\n  lastName @skip(if: $__RelayResponseNormalizerTest_pvFragment__skipLastName)\n  username @skip(if: $__RelayResponseNormalizerTest_pvFragment__skipUsername)\n}\n",
    "providedVariables": {
      "__RelayResponseNormalizerTest_pvFragment__includeName": require('./../RelayProvider_returnsTrue'),
      "__RelayResponseNormalizerTest_pvFragment__includeFirstName": require('./../RelayProvider_returnsFalse'),
      "__RelayResponseNormalizerTest_pvFragment__skipLastName": require('./../RelayProvider_returnsFalse'),
      "__RelayResponseNormalizerTest_pvFragment__skipUsername": require('./../RelayProvider_returnsTrue')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9177ab3c4ded4d7e93ff9712ce8a59c0";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest_pvQuery$variables,
  RelayResponseNormalizerTest_pvQuery$data,
>*/);
