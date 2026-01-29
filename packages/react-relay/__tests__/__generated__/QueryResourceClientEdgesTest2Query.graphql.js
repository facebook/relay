/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c6eb84c05699defb1f340f7822cc6f60>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { QueryResourceClientEdgesTestUser1Fragment$fragmentType } from "./QueryResourceClientEdgesTestUser1Fragment.graphql";
import type { QueryResourceClientEdgesTestUser2Fragment$fragmentType } from "./QueryResourceClientEdgesTestUser2Fragment.graphql";
import type { UserClientEdgeResolver$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/UserClientEdgeResolver.graphql";
import {client_edge as userClientEdgeResolverType} from "../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType: (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type QueryResourceClientEdgesTest2Query$variables = {||};
export type QueryResourceClientEdgesTest2Query$data = {|
  +me: ?{|
    +client_edge: ?{|
      +$fragmentSpreads: QueryResourceClientEdgesTestUser1Fragment$fragmentType & QueryResourceClientEdgesTestUser2Fragment$fragmentType,
    |},
  |},
|};
export type QueryResourceClientEdgesTest2Query = {|
  response: QueryResourceClientEdgesTest2Query$data,
  variables: QueryResourceClientEdgesTest2Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "QueryResourceClientEdgesTest2Query",
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
            "operation": require('./ClientEdgeQuery_QueryResourceClientEdgesTest2Query_me__client_edge.graphql'),
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
              "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeResolver').client_edge,
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
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "QueryResourceClientEdgesTestUser1Fragment"
                },
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "QueryResourceClientEdgesTestUser2Fragment"
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
    "name": "QueryResourceClientEdgesTest2Query",
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
    "cacheID": "08d2aff6ce206e567ac8d47feb22265e",
    "id": null,
    "metadata": {},
    "name": "QueryResourceClientEdgesTest2Query",
    "operationKind": "query",
    "text": "query QueryResourceClientEdgesTest2Query {\n  me {\n    ...UserClientEdgeResolver\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "0e90f7bbad806fa00859d97367fe56b8";
}

module.exports = ((node/*: any*/)/*: Query<
  QueryResourceClientEdgesTest2Query$variables,
  QueryResourceClientEdgesTest2Query$data,
>*/);
