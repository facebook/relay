/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c2b62b79e9a90a323e341618be29abbc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceWithOperationTrackerSuspenseTestFragment$fragmentType } from "./FragmentResourceWithOperationTrackerSuspenseTestFragment.graphql";
export type FragmentResourceWithOperationTrackerSuspenseTestQuery$variables = {|
  id: string,
|};
export type FragmentResourceWithOperationTrackerSuspenseTestQuery$data = {|
  +node: ?{|
    +__typename: string,
    +$fragmentSpreads: FragmentResourceWithOperationTrackerSuspenseTestFragment$fragmentType,
  |},
|};
export type FragmentResourceWithOperationTrackerSuspenseTestQuery = {|
  response: FragmentResourceWithOperationTrackerSuspenseTestQuery$data,
  variables: FragmentResourceWithOperationTrackerSuspenseTestQuery$variables,
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceWithOperationTrackerSuspenseTestQuery",
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
            "name": "FragmentResourceWithOperationTrackerSuspenseTestFragment"
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
    "name": "FragmentResourceWithOperationTrackerSuspenseTestQuery",
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9f986aa05e2829cbb73fb03a13b16e06",
    "id": null,
    "metadata": {},
    "name": "FragmentResourceWithOperationTrackerSuspenseTestQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerSuspenseTestQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...FragmentResourceWithOperationTrackerSuspenseTestFragment\n    id\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerSuspenseTestFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b3105aa8587f88e054af71980209e680";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerSuspenseTestQuery$variables,
  FragmentResourceWithOperationTrackerSuspenseTestQuery$data,
>*/);
