/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<567baaa0c209320f3f5e49f65363a923>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { usePreloadedQueryReactDoubleEffectsTestFragment$fragmentType } from "./usePreloadedQueryReactDoubleEffectsTestFragment.graphql";
export type usePreloadedQueryReactDoubleEffectsTestQuery$variables = {|
  id?: ?string,
|};
export type usePreloadedQueryReactDoubleEffectsTestQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: usePreloadedQueryReactDoubleEffectsTestFragment$fragmentType,
  |},
|};
export type usePreloadedQueryReactDoubleEffectsTestQuery = {|
  response: usePreloadedQueryReactDoubleEffectsTestQuery$data,
  variables: usePreloadedQueryReactDoubleEffectsTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
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
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "usePreloadedQueryReactDoubleEffectsTestQuery",
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
          (v3/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "usePreloadedQueryReactDoubleEffectsTestFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "usePreloadedQueryReactDoubleEffectsTestQuery",
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
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "firstName",
                "storageKey": null
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
    "cacheID": "198c5ae22c8cea174c92cc85334cfb31",
    "id": null,
    "metadata": {},
    "name": "usePreloadedQueryReactDoubleEffectsTestQuery",
    "operationKind": "query",
    "text": "query usePreloadedQueryReactDoubleEffectsTestQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...usePreloadedQueryReactDoubleEffectsTestFragment\n  }\n}\n\nfragment usePreloadedQueryReactDoubleEffectsTestFragment on User {\n  firstName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5f8dbf688a5b0fad6793fda136b755ff";
}

module.exports = ((node/*: any*/)/*: Query<
  usePreloadedQueryReactDoubleEffectsTestQuery$variables,
  usePreloadedQueryReactDoubleEffectsTestQuery$data,
>*/);
