/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1125422887ca67ed83a8d5172cf39e99>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { ClientEdgesTest5Query_user$fragmentType } from "./ClientEdgesTest5Query_user.graphql";
import {same_user_client_edge as userSameUserClientEdgeResolverType} from "../ClientEdges-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userSameUserClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userSameUserClientEdgeResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type ClientEdgesTest5Query$variables = {||};
export type ClientEdgesTest5Query$data = {|
  +me: ?{|
    +same_user_client_edge: ?{|
      +$fragmentSpreads: ClientEdgesTest5Query_user$fragmentType,
    |},
  |},
|};
export type ClientEdgesTest5Query = {|
  response: ClientEdgesTest5Query$data,
  variables: ClientEdgesTest5Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ClientEdgesTest5Query",
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
            "kind": "ClientEdgeToServerObject",
            "operation": require('./ClientEdgeQuery_ClientEdgesTest5Query_me__same_user_client_edge.graphql'),
            "backingField": {
              "alias": null,
              "args": null,
              "fragment": null,
              "kind": "RelayResolver",
              "name": "same_user_client_edge",
              "resolverModule": require('../ClientEdges-test').same_user_client_edge,
              "path": "me.same_user_client_edge"
            },
            "linkedField": {
              "alias": null,
              "args": null,
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "same_user_client_edge",
              "plural": false,
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "ClientEdgesTest5Query_user"
                }
              ],
              "storageKey": null
            }
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
    "name": "ClientEdgesTest5Query",
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
            "name": "same_user_client_edge",
            "args": null,
            "fragment": null,
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
    "cacheID": "92f648bfaec7c9135a689dd9dd5b3fe4",
    "id": null,
    "metadata": {},
    "name": "ClientEdgesTest5Query",
    "operationKind": "query",
    "text": "query ClientEdgesTest5Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "8274337dee7283631e4c2d3992c0add6";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgesTest5Query$variables,
  ClientEdgesTest5Query$data,
>*/);
