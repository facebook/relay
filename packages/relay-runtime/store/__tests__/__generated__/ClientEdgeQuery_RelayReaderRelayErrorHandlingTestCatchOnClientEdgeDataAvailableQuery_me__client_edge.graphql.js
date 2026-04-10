/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<137c909e204fd50de629f1a2a1c7d782>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$fragmentType } from "./RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge.graphql";
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge = {|
  response: ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$data,
  variables: ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge"
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
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge",
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
    "cacheID": "6a4af87a252e9e25145d795d613464a0",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge on User {\n  firstName\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "c386403954c3fa0f065c7db6580ee9cc";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$variables,
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge$data,
>*/);
