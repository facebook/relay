/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f4204fb6d663cd3c2ab59a01fffd4345>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$fragmentType } from "./RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge.graphql";
export type ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge = {|
  response: ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$data,
  variables: ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$variables,
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
    "name": "ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge",
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
            "name": "RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge"
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
    "name": "ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge",
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
    "cacheID": "9487f23e0ee413e8c3d4e878911d6484",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e84993737b8022e99659ef3064e0aeea";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$variables,
  ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge$data,
>*/);
