/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f44194fe3033ca49a3b26ca4297b5dfb>>
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
export type preloadQueryDEPRECATEDTest_ProvidedVarQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType,
  |},
|};
export type preloadQueryDEPRECATEDTest_ProvidedVarQuery = {|
  response: preloadQueryDEPRECATEDTest_ProvidedVarQuery$data,
  variables: preloadQueryDEPRECATEDTest_ProvidedVarQuery$variables,
|};
type ProvidedVariablesType = {|
  +__relay_internal__pv__RelayProvider_returnsFalse: {|
    +get: () => boolean,
  |},
  +__relay_internal__pv__RelayProvider_returnsTrue: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariablesDefinition/*: ProvidedVariablesType*/ = {
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
        "name": "__relay_internal__pv__RelayProvider_returnsTrue"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__RelayProvider_returnsFalse"
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
    "cacheID": "aba73d30b35284819b8a5e88221657f4",
    "id": null,
    "metadata": {},
    "name": "preloadQueryDEPRECATEDTest_ProvidedVarQuery",
    "operationKind": "query",
    "text": "query preloadQueryDEPRECATEDTest_ProvidedVarQuery(\n  $id: ID!\n  $__relay_internal__pv__RelayProvider_returnsTrue: Boolean!\n  $__relay_internal__pv__RelayProvider_returnsFalse: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...preloadQueryDEPRECATEDTest_ProvidedVarFragment\n    id\n  }\n}\n\nfragment preloadQueryDEPRECATEDTest_ProvidedVarFragment on User {\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsTrue)\n  firstName @include(if: $__relay_internal__pv__RelayProvider_returnsFalse)\n  lastName @skip(if: $__relay_internal__pv__RelayProvider_returnsFalse)\n  username @skip(if: $__relay_internal__pv__RelayProvider_returnsTrue)\n}\n",
    "providedVariables": providedVariablesDefinition
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
