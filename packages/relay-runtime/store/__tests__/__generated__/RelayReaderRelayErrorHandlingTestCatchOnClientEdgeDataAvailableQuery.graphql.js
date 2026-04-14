/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f01ce149202d6c837d6a58b0fc3433c6>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { UserClientEdgeResolver$key } from "./../resolvers/__generated__/UserClientEdgeResolver.graphql";
import {client_edge as userClientEdgeResolverType} from "../resolvers/UserClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType as (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery$data = {|
  +me: ?{|
    +client_edge: ?{|
      +firstName: ?string,
    |},
  |},
|};
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery = {|
  response: RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery$data,
  variables: RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "CatchField",
            "field": {
              "kind": "ClientEdgeToServerObject",
              "operation": require('./ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery_me__client_edge.graphql'),
              "backingField": {
                "alias": null,
                "args": null,
                "fragment": {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "UserClientEdgeResolver"
                },
                "kind": "RelayResolver",
                "name": "client_edge",
                "resolverModule": require('../resolvers/UserClientEdgeResolver').client_edge,
                "path": "me.client_edge"
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "client_edge",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "firstName",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            },
            "to": "NULL"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "name": "client_edge",
            "args": null,
            "fragment": {
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
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": false
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
    "cacheID": "e63410a5439872cfefd9b471c0c39f70",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery {\n  me {\n    ...UserClientEdgeResolver\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "c386403954c3fa0f065c7db6580ee9cc";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery$variables,
  RelayReaderRelayErrorHandlingTestCatchOnClientEdgeDataAvailableQuery$data,
>*/);
