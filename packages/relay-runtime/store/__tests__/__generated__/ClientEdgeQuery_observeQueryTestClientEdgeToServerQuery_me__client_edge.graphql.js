/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<eae0db08755b61deb0303c18ddc1c2b7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$fragmentType } from "./RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge.graphql";
export type ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge = {|
  response: ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$data,
  variables: ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge"
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
    "name": "ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge",
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
    "cacheID": "24cc155fed24ded00a99f90e67a86182",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge on User {\n  name\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ffa93f1454a0796bf5a92612348c1069";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$variables,
  ClientEdgeQuery_observeQueryTestClientEdgeToServerQuery_me__client_edge$data,
>*/);
