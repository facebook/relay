/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bbfbe1b79e98de906b541d5cc37b5b06>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType } from "./usePreloadedQueryProvidedVariablesTest_Fragment.graphql";
export type usePreloadedQueryProvidedVariablesTest_Query$variables = {|
  id: string,
|};
export type usePreloadedQueryProvidedVariablesTest_Query$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: usePreloadedQueryProvidedVariablesTest_Fragment$fragmentType,
  |},
|};
export type usePreloadedQueryProvidedVariablesTest_Query = {|
  response: usePreloadedQueryProvidedVariablesTest_Query$data,
  variables: usePreloadedQueryProvidedVariablesTest_Query$variables,
|};
type ProvidedVariablesType = {|
  +__relay_internal__pv__RelayProvider_returnsFalserelayprovider: {|
    +get: () => boolean,
  |},
  +__relay_internal__pv__RelayProvider_returnsTruerelayprovider: {|
    +get: () => boolean,
  |},
|};
*/

var providedVariablesDefinition/*: ProvidedVariablesType*/ = {
  "__relay_internal__pv__RelayProvider_returnsTruerelayprovider": require('./../RelayProvider_returnsTrue.relayprovider'),
  "__relay_internal__pv__RelayProvider_returnsFalserelayprovider": require('./../RelayProvider_returnsFalse.relayprovider')
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
    "name": "usePreloadedQueryProvidedVariablesTest_Query",
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
            "name": "usePreloadedQueryProvidedVariablesTest_Fragment"
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
        "name": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__RelayProvider_returnsFalserelayprovider"
      }
    ],
    "kind": "Operation",
    "name": "usePreloadedQueryProvidedVariablesTest_Query",
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
                "condition": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider",
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
                "condition": "__relay_internal__pv__RelayProvider_returnsFalserelayprovider",
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
                "condition": "__relay_internal__pv__RelayProvider_returnsFalserelayprovider",
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
                "condition": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider",
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
    "cacheID": "b724359bc3be8cbca15cfd393ae15a36",
    "id": null,
    "metadata": {},
    "name": "usePreloadedQueryProvidedVariablesTest_Query",
    "operationKind": "query",
    "text": "query usePreloadedQueryProvidedVariablesTest_Query(\n  $id: ID!\n  $__relay_internal__pv__RelayProvider_returnsTruerelayprovider: Boolean!\n  $__relay_internal__pv__RelayProvider_returnsFalserelayprovider: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...usePreloadedQueryProvidedVariablesTest_Fragment\n  }\n}\n\nfragment usePreloadedQueryProvidedVariablesTest_Fragment on User {\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n  firstName @include(if: $__relay_internal__pv__RelayProvider_returnsFalserelayprovider)\n  lastName @skip(if: $__relay_internal__pv__RelayProvider_returnsFalserelayprovider)\n  username @skip(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n}\n",
    "providedVariables": providedVariablesDefinition
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "57f29c979bd1ac2b46b7841b521d1cb2";
}

module.exports = ((node/*: any*/)/*: Query<
  usePreloadedQueryProvidedVariablesTest_Query$variables,
  usePreloadedQueryProvidedVariablesTest_Query$data,
>*/);
