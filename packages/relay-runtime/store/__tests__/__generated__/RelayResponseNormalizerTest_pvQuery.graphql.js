/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bad330a60489b68ec71d317bc0f1355a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayResponseNormalizerTest_pvFragment$fragmentType } from "./RelayResponseNormalizerTest_pvFragment.graphql";
export type RelayResponseNormalizerTest_pvQuery$variables = {|
  id: string,
|};
export type RelayResponseNormalizerTest_pvQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayResponseNormalizerTest_pvFragment$fragmentType,
  |},
|};
export type RelayResponseNormalizerTest_pvQuery = {|
  response: RelayResponseNormalizerTest_pvQuery$data,
  variables: RelayResponseNormalizerTest_pvQuery$variables,
|};
({
  "__relay_internal__pv__RelayProvider_returnsTruerelayprovider": require('../RelayProvider_returnsTrue.relayprovider'),
  "__relay_internal__pv__RelayProvider_returnsFalserelayprovider": require('../RelayProvider_returnsFalse.relayprovider')
}: {|
  +__relay_internal__pv__RelayProvider_returnsFalserelayprovider: {|
    +get: () => boolean,
  |},
  +__relay_internal__pv__RelayProvider_returnsTruerelayprovider: {|
    +get: () => boolean,
  |},
|});
*/

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
        "name": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__RelayProvider_returnsFalserelayprovider"
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
    "cacheID": "996f1711aec0ab7951cc8940ee9d2eca",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest_pvQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest_pvQuery(\n  $id: ID!\n  $__relay_internal__pv__RelayProvider_returnsTruerelayprovider: Boolean!\n  $__relay_internal__pv__RelayProvider_returnsFalserelayprovider: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...RelayResponseNormalizerTest_pvFragment\n  }\n}\n\nfragment RelayResponseNormalizerTest_pvFragment on User {\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n  firstName @include(if: $__relay_internal__pv__RelayProvider_returnsFalserelayprovider)\n  lastName @skip(if: $__relay_internal__pv__RelayProvider_returnsFalserelayprovider)\n  username @skip(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n}\n",
    "providedVariables": {
      "__relay_internal__pv__RelayProvider_returnsTruerelayprovider": require('../RelayProvider_returnsTrue.relayprovider'),
      "__relay_internal__pv__RelayProvider_returnsFalserelayprovider": require('../RelayProvider_returnsFalse.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3d11c5d77a6b30dd28ee9a5eb421373d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest_pvQuery$variables,
  RelayResponseNormalizerTest_pvQuery$data,
>*/);
