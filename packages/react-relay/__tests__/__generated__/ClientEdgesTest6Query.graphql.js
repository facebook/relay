/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7b8a2fff0ac8a3e5b71333c58dbc823f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { ClientEdgesTestUpperName$key } from "./ClientEdgesTestUpperName.graphql";
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
import {upper_name as userUpperNameResolverType} from "../ClientEdges-test.js";
// Type assertion validating that `userUpperNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userUpperNameResolverType: (
  rootKey: ClientEdgesTestUpperName$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type ClientEdgesTest6Query$variables = {||};
export type ClientEdgesTest6Query$data = {|
  +me: ?{|
    +same_user_client_edge: ?{|
      +upper_name: ?string,
    |},
  |},
|};
export type ClientEdgesTest6Query = {|
  response: ClientEdgesTest6Query$data,
  variables: ClientEdgesTest6Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ClientEdgesTest6Query",
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
            "operation": require('./ClientEdgeQuery_ClientEdgesTest6Query_me__same_user_client_edge.graphql'),
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
                  "alias": null,
                  "args": null,
                  "fragment": {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "ClientEdgesTestUpperName"
                  },
                  "kind": "RelayResolver",
                  "name": "upper_name",
                  "resolverModule": require('../ClientEdges-test').upper_name,
                  "path": "me.same_user_client_edge.upper_name"
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
    "name": "ClientEdgesTest6Query",
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
    "cacheID": "e62271734cfff9eb7b0535fd011e32b3",
    "id": null,
    "metadata": {},
    "name": "ClientEdgesTest6Query",
    "operationKind": "query",
    "text": "query ClientEdgesTest6Query {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "330a0878ce30575d8c36e2fdd626c833";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgesTest6Query$variables,
  ClientEdgesTest6Query$data,
>*/);
