/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d5d864094f578bb1d1639a82f2c805ae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$fragmentType } from "./RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge.graphql";
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge = {|
  response: ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$data,
  variables: ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$variables,
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge"
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
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
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
                "name": "firstName",
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
    "cacheID": "ea92f2f64a916a80b866ad218c43d8a1",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge on User {\n  firstName\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "e2f870cb409863e7a5a038da3aed8d82";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$variables,
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge$data,
>*/);
