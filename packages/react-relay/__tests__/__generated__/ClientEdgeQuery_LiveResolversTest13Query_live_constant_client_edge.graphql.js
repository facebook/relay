/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8f0c379c017fd8ec7fdc521834a54ee2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$fragmentType } from "./RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge.graphql";
export type ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge = {|
  response: ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$data,
  variables: ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$variables,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge",
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
            "name": "RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge"
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
    "name": "ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge",
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
    "cacheID": "940a88381f0c747160590c93c309489b",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge on User {\n  name\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5e0a692af3d1acd9f3fbcb5fe00b0e77";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$variables,
  ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge$data,
>*/);
