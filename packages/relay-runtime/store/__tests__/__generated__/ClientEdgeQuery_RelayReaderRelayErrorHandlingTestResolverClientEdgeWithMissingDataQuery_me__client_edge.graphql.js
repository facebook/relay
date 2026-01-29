/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c53005a92baed2db5ba0e470c2501249>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$fragmentType } from "./RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge.graphql";
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge = {|
  response: ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$data,
  variables: ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge"
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
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge",
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
    "cacheID": "e47549d74855f68f97e2b686ad601ea7",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge on User {\n  firstName\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d3fd8c798ab7357a229e7b8e79799744";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$variables,
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestResolverClientEdgeWithMissingDataQuery_me__client_edge$data,
>*/);
