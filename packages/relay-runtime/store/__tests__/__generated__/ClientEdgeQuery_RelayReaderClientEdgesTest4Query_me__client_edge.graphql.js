/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5fcf88c330efa0f0de6a44d554f6f4a8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge$fragmentType } from "./RefetchableClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge.graphql";
export type ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge = {|
  response: ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge$data,
  variables: ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge"
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
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge",
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
                "name": "another_client_edge",
                "args": null,
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    (v2/*: any*/)
                  ],
                  "type": "User",
                  "abstractKey": null
                },
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": false
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
    "cacheID": "03a0ce66683905bff70e48b0480d737b",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge on User {\n  ...UserAnotherClientEdgeResolver\n  id\n}\n\nfragment UserAnotherClientEdgeResolver on User {\n  __typename\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f12dcfffcc6bbf929b4fad3a4eb5602d";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge$variables,
  ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge$data,
>*/);
