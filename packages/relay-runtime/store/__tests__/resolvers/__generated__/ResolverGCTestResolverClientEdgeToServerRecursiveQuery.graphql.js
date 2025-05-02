/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ce24691de836cbd17f6f9c94fa0da9fa>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { UserAnotherClientEdgeResolver$key } from "./UserAnotherClientEdgeResolver.graphql";
import type { UserClientEdgeResolver$key } from "./UserClientEdgeResolver.graphql";
import {another_client_edge as userAnotherClientEdgeResolverType} from "../UserAnotherClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userAnotherClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAnotherClientEdgeResolverType: (
  rootKey: UserAnotherClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
import {client_edge as userClientEdgeResolverType} from "../UserClientEdgeResolver.js";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType: (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type ResolverGCTestResolverClientEdgeToServerRecursiveQuery$variables = {||};
export type ResolverGCTestResolverClientEdgeToServerRecursiveQuery$data = {|
  +me: ?{|
    +client_edge: ?{|
      +another_client_edge: ?{|
        +id: string,
        +name: ?string,
      |},
      +id: string,
      +name: ?string,
    |},
    +name: ?string,
  |},
|};
export type ResolverGCTestResolverClientEdgeToServerRecursiveQuery = {|
  response: ResolverGCTestResolverClientEdgeToServerRecursiveQuery$data,
  variables: ResolverGCTestResolverClientEdgeToServerRecursiveQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ResolverGCTestResolverClientEdgeToServerRecursiveQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "kind": "ClientEdgeToServerObject",
            "operation": require('./ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge.graphql'),
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
              "resolverModule": require('../UserClientEdgeResolver').client_edge,
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
                (v1/*: any*/),
                (v0/*: any*/),
                {
                  "kind": "ClientEdgeToServerObject",
                  "operation": require('./ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerRecursiveQuery_me__client_edge__another_client_edge.graphql'),
                  "backingField": {
                    "alias": null,
                    "args": null,
                    "fragment": {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "UserAnotherClientEdgeResolver"
                    },
                    "kind": "RelayResolver",
                    "name": "another_client_edge",
                    "resolverModule": require('../UserAnotherClientEdgeResolver').another_client_edge,
                    "path": "me.client_edge.another_client_edge"
                  },
                  "linkedField": {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "another_client_edge",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      (v0/*: any*/)
                    ],
                    "storageKey": null
                  }
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
    "name": "ResolverGCTestResolverClientEdgeToServerRecursiveQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          {
            "name": "client_edge",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                (v0/*: any*/)
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": false
          },
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "cf864f4819a94ac795d3c3a30efb7650",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestResolverClientEdgeToServerRecursiveQuery",
    "operationKind": "query",
    "text": "query ResolverGCTestResolverClientEdgeToServerRecursiveQuery {\n  me {\n    name\n    ...UserClientEdgeResolver\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e84993737b8022e99659ef3064e0aeea";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverGCTestResolverClientEdgeToServerRecursiveQuery$variables,
  ResolverGCTestResolverClientEdgeToServerRecursiveQuery$data,
>*/);
