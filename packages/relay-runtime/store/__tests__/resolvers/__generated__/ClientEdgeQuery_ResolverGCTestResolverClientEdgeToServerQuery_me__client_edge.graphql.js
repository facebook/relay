/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f2265fd5baf8d95a0c88ffff1c7cc1eb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$fragmentType } from "./RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge.graphql";
export type ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge = {|
  response: ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$data,
  variables: ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge"
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
    "name": "ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge",
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
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "nearest_neighbor",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/)
                ],
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
    "cacheID": "ceffb76687dcce7b468fb0741e240e73",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge on User {\n  id\n  name\n  nearest_neighbor {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fe9d1d04537877d59f4905abc58c777f";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$variables,
  ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge$data,
>*/);
