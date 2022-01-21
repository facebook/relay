/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ee38545de016215af280bacf01f7cc4c>>
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
  +__relay_internal__pv__RelayProvider_returnsTrue: {|
    +get: () => boolean,
  |},
  +__relay_internal__pv__RelayProvider_returnsFalse: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariableProviders/*: ProvidedVariableProviderType*/ = {
  "__relay_internal__pv__RelayProvider_returnsTrue": require('./../RelayProvider_returnsTrue'),
  "__relay_internal__pv__RelayProvider_returnsFalse": require('./../RelayProvider_returnsFalse')
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
        "name": "__relay_internal__pv__RelayProvider_returnsTrue"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__RelayProvider_returnsFalse"
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
                "condition": "__relay_internal__pv__RelayProvider_returnsTrue",
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
                "condition": "__relay_internal__pv__RelayProvider_returnsFalse",
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
                "condition": "__relay_internal__pv__RelayProvider_returnsFalse",
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
                "condition": "__relay_internal__pv__RelayProvider_returnsTrue",
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
    "cacheID": "85269c9451accb2fc5d9de6defd85356",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest_pvQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest_pvQuery(\n  $id: ID!\n  $__relay_internal__pv__RelayProvider_returnsTrue: Boolean!\n  $__relay_internal__pv__RelayProvider_returnsFalse: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayResponseNormalizerTest_pvFragment\n  }\n}\n\nfragment RelayResponseNormalizerTest_pvFragment on User {\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsTrue)\n  firstName @include(if: $__relay_internal__pv__RelayProvider_returnsFalse)\n  lastName @skip(if: $__relay_internal__pv__RelayProvider_returnsFalse)\n  username @skip(if: $__relay_internal__pv__RelayProvider_returnsTrue)\n}\n",
    "providedVariables": {
      "__relay_internal__pv__RelayProvider_returnsTrue": require('./../RelayProvider_returnsTrue'),
      "__relay_internal__pv__RelayProvider_returnsFalse": require('./../RelayProvider_returnsFalse')
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
