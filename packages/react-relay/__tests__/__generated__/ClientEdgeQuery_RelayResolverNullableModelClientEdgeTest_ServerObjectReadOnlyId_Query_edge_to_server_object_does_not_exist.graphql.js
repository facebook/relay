/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9151cadaf4abeb5c370580eca29aa399>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$fragmentType } from "./RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist.graphql";
export type ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$variables = {|
  id: string,
|};
export type ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$fragmentType,
  |},
|};
export type ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist = {|
  response: ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$data,
  variables: ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$variables,
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
    "name": "ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist",
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
            "name": "RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist"
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
    "name": "ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist",
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
    "cacheID": "3b1b145feebb57a5f456912d1a263861",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist on Comment {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6e6fc82ab5969e84d7c748516d16686b";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$variables,
  ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObjectReadOnlyId_Query_edge_to_server_object_does_not_exist$data,
>*/);
