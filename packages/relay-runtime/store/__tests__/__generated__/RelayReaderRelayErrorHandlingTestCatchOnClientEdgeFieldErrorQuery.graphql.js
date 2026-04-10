/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b4259dbc95f04f66ad0c2ba8d1cd3463>>
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
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery$variables = {||};
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery$data = {|
  +me: ?{|
    +client_edge: ?{|
      +lastName: ?string,
    |},
  |},
|};
export type RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery = {|
  response: RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery$data,
  variables: RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery$variables,
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
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery",
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
              "operation": require('./ClientEdgeQuery_RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery_me__client_edge.graphql'),
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
                    "name": "lastName",
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
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery",
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
    "cacheID": "ac6d0a7a5f27e2892fc76155d3c6a6ba",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery {\n  me {\n    ...UserClientEdgeResolver\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*:: as any*/).hash = "5c9ed84fff2ab3847198237e2d752e9e";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery$variables,
  RelayReaderRelayErrorHandlingTestCatchOnClientEdgeFieldErrorQuery$data,
>*/);
