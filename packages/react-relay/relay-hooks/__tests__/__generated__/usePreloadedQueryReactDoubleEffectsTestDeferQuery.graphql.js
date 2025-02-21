/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6f689958c3f5e6e047263cd944af4020>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { usePreloadedQueryReactDoubleEffectsTestFragment$fragmentType } from "./usePreloadedQueryReactDoubleEffectsTestFragment.graphql";
export type usePreloadedQueryReactDoubleEffectsTestDeferQuery$variables = {|
  id?: ?string,
|};
export type usePreloadedQueryReactDoubleEffectsTestDeferQuery$data = {|
  +node: ?{|
    +id: string,
    +name: ?string,
    +$fragmentSpreads: usePreloadedQueryReactDoubleEffectsTestFragment$fragmentType,
  |},
|};
export type usePreloadedQueryReactDoubleEffectsTestDeferQuery = {|
  response: usePreloadedQueryReactDoubleEffectsTestDeferQuery$data,
  variables: usePreloadedQueryReactDoubleEffectsTestDeferQuery$variables,
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
    "name": "usePreloadedQueryReactDoubleEffectsTestDeferQuery",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "usePreloadedQueryReactDoubleEffectsTestFragment"
              }
            ]
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
    "name": "usePreloadedQueryReactDoubleEffectsTestDeferQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "usePreloadedQueryReactDoubleEffectsTestDeferQuery$defer$usePreloadedQueryReactDoubleEffectsTestFragment",
            "selections": [
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
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "50bb5d07e7d74589c2a332a9819f2c17",
    "id": null,
    "metadata": {},
    "name": "usePreloadedQueryReactDoubleEffectsTestDeferQuery",
    "operationKind": "query",
    "text": "query usePreloadedQueryReactDoubleEffectsTestDeferQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    id\n    name\n    ...usePreloadedQueryReactDoubleEffectsTestFragment @defer(label: \"usePreloadedQueryReactDoubleEffectsTestDeferQuery$defer$usePreloadedQueryReactDoubleEffectsTestFragment\")\n  }\n}\n\nfragment usePreloadedQueryReactDoubleEffectsTestFragment on User {\n  firstName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4b7abb047aa04c8ea7c19b5ab39e46ed";
}

module.exports = ((node/*: any*/)/*: Query<
  usePreloadedQueryReactDoubleEffectsTestDeferQuery$variables,
  usePreloadedQueryReactDoubleEffectsTestDeferQuery$data,
>*/);
