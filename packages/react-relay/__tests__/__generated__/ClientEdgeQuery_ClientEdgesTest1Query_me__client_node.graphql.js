/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c77c51e6d5e85f52cbc53ffe59e41e4b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$fragmentType } from "./RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node.graphql";
export type ClientEdgeQuery_ClientEdgesTest1Query_me__client_node$variables = {|
  id: string,
|};
export type ClientEdgeQuery_ClientEdgesTest1Query_me__client_node$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node$fragmentType,
  |},
|};
export type ClientEdgeQuery_ClientEdgesTest1Query_me__client_node = {|
  response: ClientEdgeQuery_ClientEdgesTest1Query_me__client_node$data,
  variables: ClientEdgeQuery_ClientEdgesTest1Query_me__client_node$variables,
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
    "name": "ClientEdgeQuery_ClientEdgesTest1Query_me__client_node",
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
            "name": "RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node"
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
    "name": "ClientEdgeQuery_ClientEdgesTest1Query_me__client_node",
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
            "kind": "TypeDiscriminator",
            "abstractKey": "__isNode"
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
    "cacheID": "8ab0c0b9d0c5840aa3bd05b7424dadd3",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_ClientEdgesTest1Query_me__client_node",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_ClientEdgesTest1Query_me__client_node(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_ClientEdgesTest1Query_me__client_node on Node {\n  __isNode: __typename\n  ... on User {\n    name\n  }\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "69d7fa3908eedb4d634799d1252e80a7";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_ClientEdgesTest1Query_me__client_node$variables,
  ClientEdgeQuery_ClientEdgesTest1Query_me__client_node$data,
>*/);
