/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bbbe662437b6742d4525f7b2b40f4c0b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType } from "./useFragmentWithDeferAndLiveUpdateTestFragment.graphql";
export type useFragmentWithDeferAndLiveUpdateTestQuery$variables = {|
  id: string,
|};
export type useFragmentWithDeferAndLiveUpdateTestQuery$data = {|
  +node: ?{|
    +__typename: string,
    +id: string,
    +$fragmentSpreads: useFragmentWithDeferAndLiveUpdateTestFragment$fragmentType,
  |},
|};
export type useFragmentWithDeferAndLiveUpdateTestQuery = {|
  response: useFragmentWithDeferAndLiveUpdateTestQuery$data,
  variables: useFragmentWithDeferAndLiveUpdateTestQuery$variables,
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
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "useFragmentWithDeferAndLiveUpdateTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "useFragmentWithDeferAndLiveUpdateTestFragment"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "useFragmentWithDeferAndLiveUpdateTestQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "if": null,
            "kind": "Defer",
            "label": "useFragmentWithDeferAndLiveUpdateTestQuery$defer$useFragmentWithDeferAndLiveUpdateTestFragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
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
    "cacheID": "b4906d55de1832197f29cd7c87ca9788",
    "id": null,
    "metadata": {},
    "name": "useFragmentWithDeferAndLiveUpdateTestQuery",
    "operationKind": "query",
    "text": "query useFragmentWithDeferAndLiveUpdateTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    id\n    ...useFragmentWithDeferAndLiveUpdateTestFragment @defer(label: \"useFragmentWithDeferAndLiveUpdateTestQuery$defer$useFragmentWithDeferAndLiveUpdateTestFragment\")\n  }\n}\n\nfragment useFragmentWithDeferAndLiveUpdateTestFragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "2f1e35e18dce79d4884d6fe2b9bbe340";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useFragmentWithDeferAndLiveUpdateTestQuery$variables,
  useFragmentWithDeferAndLiveUpdateTestQuery$data,
>*/);
