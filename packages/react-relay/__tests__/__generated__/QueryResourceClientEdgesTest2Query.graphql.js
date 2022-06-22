/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<53ba5776188bb4ebb5db943e5fd49f6d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type QueryResourceClientEdgesTestUser1Fragment$fragmentType = any;
type QueryResourceClientEdgesTestUser2Fragment$fragmentType = any;
type UserClientEdgeResolver$key = any;
import userClientEdgeResolver from "../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeResolver.js";
// Type assertion validating that `userClientEdgeResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolver: (
  rootKey: UserClientEdgeResolver$key, 
) => mixed);
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
              "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeResolver.js'),
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
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
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
