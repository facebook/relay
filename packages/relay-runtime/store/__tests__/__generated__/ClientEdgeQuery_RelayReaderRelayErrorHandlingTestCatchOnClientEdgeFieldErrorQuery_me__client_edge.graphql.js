/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d31efe526e85935b26fc0c3cddd55ed1>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$fragmentType } from "./RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge.graphql";
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$variables = {|
  id: string,
|};
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$data = {|
  +node: ?{|
    +$fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$fragmentType,
  |},
|};
export type ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge = {|
  response: ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$data,
  variables: ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$variables,
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
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge",
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
            "name": "RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge"
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
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge",
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
                "name": "lastName",
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
    "cacheID": "1a11f1b32f4e689ff1ade7e1ee9f4900",
    "id": null,
    "metadata": {},
    "name": "ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge",
    "operationKind": "query",
    "text": "query ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge\n    id\n  }\n}\n\nfragment RefetchableClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge on User {\n  lastName\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "5c9ed84fff2ab3847198237e2d752e9e";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$variables,
  ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge$data,
>*/);
