/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<593b3030b73bbadda5607047611b5d02>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { preloadQueryDEPRECATEDTest_ProvidedVarFragment$fragmentType } from "./preloadQueryDEPRECATEDTest_ProvidedVarFragment.graphql";
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
        "name": "__relay_internal__pv__RelayProvider_returnsTruerelayprovider"
      },
      {
        "defaultValue": null,
        "kind": "LocalArgument",
        "name": "__relay_internal__pv__RelayProvider_returnsFalserelayprovider"
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
    "cacheID": "b3f2eef01bf7468a17189b8a5784c719",
    "id": null,
    "metadata": {},
    "name": "preloadQueryDEPRECATEDTest_ProvidedVarQuery",
    "operationKind": "query",
    "text": "query preloadQueryDEPRECATEDTest_ProvidedVarQuery(\n  $id: ID!\n  $__relay_internal__pv__RelayProvider_returnsTruerelayprovider: Boolean!\n  $__relay_internal__pv__RelayProvider_returnsFalserelayprovider: Boolean!\n) {\n  node(id: $id) {\n    __typename\n    ...preloadQueryDEPRECATEDTest_ProvidedVarFragment\n    id\n  }\n}\n\nfragment preloadQueryDEPRECATEDTest_ProvidedVarFragment on User {\n  name @include(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n  firstName @include(if: $__relay_internal__pv__RelayProvider_returnsFalserelayprovider)\n  lastName @skip(if: $__relay_internal__pv__RelayProvider_returnsFalserelayprovider)\n  username @skip(if: $__relay_internal__pv__RelayProvider_returnsTruerelayprovider)\n}\n",
    "providedVariables": {
      "__relay_internal__pv__RelayProvider_returnsTruerelayprovider": require('../RelayProvider_returnsTrue.relayprovider'),
      "__relay_internal__pv__RelayProvider_returnsFalserelayprovider": require('../RelayProvider_returnsFalse.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4979a880c3f4961191919f23c6de8c42";
}

module.exports = ((node/*: any*/)/*: Query<
  preloadQueryDEPRECATEDTest_ProvidedVarQuery$variables,
  preloadQueryDEPRECATEDTest_ProvidedVarQuery$data,
>*/);
