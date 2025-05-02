/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8c98dbf87be396aee280980643b58fe5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { usePreloadedQueryProvidedVariablesTest_badFragment$fragmentType } from "./usePreloadedQueryProvidedVariablesTest_badFragment.graphql";
export type usePreloadedQueryProvidedVariablesTest_badQuery$variables = {|
  id: string,
|};
export type usePreloadedQueryProvidedVariablesTest_badQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: usePreloadedQueryProvidedVariablesTest_badFragment$fragmentType,
  |},
|};
export type usePreloadedQueryProvidedVariablesTest_badQuery = {|
  response: usePreloadedQueryProvidedVariablesTest_badQuery$data,
  variables: usePreloadedQueryProvidedVariablesTest_badQuery$variables,
|};
({
  "__relay_internal__pv__RelayProvider_impurerelayprovider": require('../RelayProvider_impure.relayprovider')
}: {|
  +__relay_internal__pv__RelayProvider_impurerelayprovider: {|
    +get: () => number,
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
    "name": "usePreloadedQueryProvidedVariablesTest_badQuery",
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
            "name": "usePreloadedQueryProvidedVariablesTest_badFragment"
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
        "name": "__relay_internal__pv__RelayProvider_impurerelayprovider"
      }
    ],
    "kind": "Operation",
    "name": "usePreloadedQueryProvidedVariablesTest_badQuery",
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
                "alias": null,
                "args": [
                  {
                    "kind": "Variable",
                    "name": "scale",
                    "variableName": "__relay_internal__pv__RelayProvider_impurerelayprovider"
                  }
                ],
                "concreteType": "Image",
                "kind": "LinkedField",
                "name": "profile_picture",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "uri",
                    "storageKey": null
                  }
                ],
                "storageKey": null
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
    "cacheID": "09a37991c0862d8278389074ccdfff06",
    "id": null,
    "metadata": {},
    "name": "usePreloadedQueryProvidedVariablesTest_badQuery",
    "operationKind": "query",
    "text": "query usePreloadedQueryProvidedVariablesTest_badQuery(\n  $id: ID!\n  $__relay_internal__pv__RelayProvider_impurerelayprovider: Float!\n) {\n  node(id: $id) {\n    __typename\n    ...usePreloadedQueryProvidedVariablesTest_badFragment\n    id\n  }\n}\n\nfragment usePreloadedQueryProvidedVariablesTest_badFragment on User {\n  profile_picture(scale: $__relay_internal__pv__RelayProvider_impurerelayprovider) {\n    uri\n  }\n}\n",
    "providedVariables": {
      "__relay_internal__pv__RelayProvider_impurerelayprovider": require('../RelayProvider_impure.relayprovider')
    }
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "9f08a83ca6f077bedba106cc1674156d";
}

module.exports = ((node/*: any*/)/*: Query<
  usePreloadedQueryProvidedVariablesTest_badQuery$variables,
  usePreloadedQueryProvidedVariablesTest_badQuery$data,
>*/);
