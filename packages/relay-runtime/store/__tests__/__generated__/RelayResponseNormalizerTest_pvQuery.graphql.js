/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7be6a3ee0ef7013db9fb44a9996703f4>>
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
        "name": "__pv__RelayProvider_returnsTrue"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__pv__RelayProvider_returnsFalse"
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
    "cacheID": "46023d6a89cb46677c25f7c7194b7167",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest_pvQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest_pvQuery(\n  $id: ID!\n  $__pv__RelayProvider_returnsTrue: Boolean!\n  $__pv__RelayProvider_returnsFalse: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayResponseNormalizerTest_pvFragment\n  }\n}\n\nfragment RelayResponseNormalizerTest_pvFragment on User {\n  name @include(if: $__pv__RelayProvider_returnsTrue)\n  firstName @include(if: $__pv__RelayProvider_returnsFalse)\n  lastName @skip(if: $__pv__RelayProvider_returnsFalse)\n  username @skip(if: $__pv__RelayProvider_returnsTrue)\n}\n",
    "providedVariables": {
      "__pv__RelayProvider_returnsTrue": require('./../RelayProvider_returnsTrue'),
      "__pv__RelayProvider_returnsFalse": require('./../RelayProvider_returnsFalse')
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
