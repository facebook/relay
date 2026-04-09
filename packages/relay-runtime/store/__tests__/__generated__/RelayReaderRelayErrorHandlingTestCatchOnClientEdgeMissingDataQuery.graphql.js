/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<867942f2603b38b5af05233bd6666409>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
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
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery$data = {|
  +me: ?{|
    +client_edge: ?{|
      +firstName: ?string,
    |},
  |},
|};
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery = {|
  response: RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery$data,
  variables: RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true,
      "throwOnFieldError": true
    },
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery",
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
              "operation": require('./ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery_me__client_edge.graphql'),
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
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery",
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
    "cacheID": "241b9ddb11be32551ace39ea984b5656",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery {\n  me {\n    ...UserClientEdgeResolver\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e2f870cb409863e7a5a038da3aed8d82";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery$variables,
  RelayReaderRelayErrorHandlingTestCatchOnClientEdgeMissingDataQuery$data,
>*/);
