/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1a43152b7b1dd916e5e9572d4546c2f7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$fragmentType } from "./RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge.graphql";
export type ClientEdgeQuery_ResolverTest3Query_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_ResolverTest3Query_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_ResolverTest3Query_me__client_edge = {|
  response: ClientEdgeQuery_ResolverTest3Query_me__client_edge$data,
  variables: ClientEdgeQuery_ResolverTest3Query_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_ResolverTest3Query_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge"
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
    "name": "ClientEdgeQuery_ResolverTest3Query_me__client_edge",
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "eb94cf93c3753324b74c71a7e7cbad9a",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_ResolverTest3Query_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_ResolverTest3Query_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_ResolverTest3Query_me__client_edge on User {\n  __typename\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "23af1732ca2b8848723c3de2d3c7231e";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_ResolverTest3Query_me__client_edge$variables,
  ClientEdgeQuery_ResolverTest3Query_me__client_edge$data,
>*/);
