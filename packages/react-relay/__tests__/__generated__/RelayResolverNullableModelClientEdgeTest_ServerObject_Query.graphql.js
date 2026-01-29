/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a87cdf47dd3933d5dc692bf52fe885cc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import {edge_to_server_object_does_not_exist as queryEdgeToServerObjectDoesNotExistResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryEdgeToServerObjectDoesNotExistResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryEdgeToServerObjectDoesNotExistResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type RelayResolverNullableModelClientEdgeTest_ServerObject_Query$variables = {||};
export type RelayResolverNullableModelClientEdgeTest_ServerObject_Query$data = {|
  +edge_to_server_object_does_not_exist: ?{|
    +name: ?string,
  |},
|};
export type RelayResolverNullableModelClientEdgeTest_ServerObject_Query = {|
  response: RelayResolverNullableModelClientEdgeTest_ServerObject_Query$data,
  variables: RelayResolverNullableModelClientEdgeTest_ServerObject_Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverNullableModelClientEdgeTest_ServerObject_Query",
    "selections": [
      {
        "kind": "ClientEdgeToServerObject",
        "operation": require('./ClientEdgeQuery_RelayResolverNullableModelClientEdgeTest_ServerObject_Query_edge_to_server_object_does_not_exist.graphql'),
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "edge_to_server_object_does_not_exist",
          "resolverModule": require('../RelayResolverNullableModelClientEdge-test').edge_to_server_object_does_not_exist,
          "path": "edge_to_server_object_does_not_exist"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "Comment",
          "kind": "LinkedField",
          "name": "edge_to_server_object_does_not_exist",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResolverNullableModelClientEdgeTest_ServerObject_Query",
    "selections": [
      {
        "name": "edge_to_server_object_does_not_exist",
        "args": null,
        "fragment": null,
        "kind": "RelayResolver",
        "storageKey": null,
        "isOutputType": false
      }
    ]
  },
  "params": {
    "cacheID": "3a648c6908a7a0fa12a1bc4e9b12d362",
    "id": null,
    "metadata": {},
    "name": "RelayResolverNullableModelClientEdgeTest_ServerObject_Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "3990dc068bf228226a21832b04bbd39a";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverNullableModelClientEdgeTest_ServerObject_Query$variables,
  RelayResolverNullableModelClientEdgeTest_ServerObject_Query$data,
>*/);
