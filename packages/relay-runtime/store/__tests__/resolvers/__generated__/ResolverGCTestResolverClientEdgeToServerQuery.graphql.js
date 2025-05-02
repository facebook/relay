/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7c4e9a5496de08cdafa104c7aca75950>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { UserClientEdgeResolver$key } from "./UserClientEdgeResolver.graphql";
import {client_edge as userClientEdgeResolverType} from "../UserClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType: (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type ResolverGCTestResolverClientEdgeToServerQuery$variables = {||};
export type ResolverGCTestResolverClientEdgeToServerQuery$data = {|
  +me: ?{|
    +client_edge: ?{|
      +id: string,
      +name: ?string,
      +nearest_neighbor: {|
        +id: string,
        +name: ?string,
      |},
    |},
    +name: ?string,
  |},
|};
export type ResolverGCTestResolverClientEdgeToServerQuery = {|
  response: ResolverGCTestResolverClientEdgeToServerQuery$data,
  variables: ResolverGCTestResolverClientEdgeToServerQuery$variables,
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
    "name": "ResolverGCTestResolverClientEdgeToServerQuery",
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
            "operation": require('./ClientEdgeQuery_ResolverGCTestResolverClientEdgeToServerQuery_me__client_edge.graphql'),
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
                  "alias": null,
                  "args": null,
                  "concreteType": "User",
                  "kind": "LinkedField",
                  "name": "nearest_neighbor",
                  "plural": false,
                  "selections": [
                    (v1/*: any*/),
                    (v0/*: any*/)
                  ],
                  "storageKey": null
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
    "name": "ResolverGCTestResolverClientEdgeToServerQuery",
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
    "cacheID": "d7bd1578205eddf51e733478872a9590",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestResolverClientEdgeToServerQuery",
    "operationKind": "query",
    "text": "query ResolverGCTestResolverClientEdgeToServerQuery {\n  me {\n    name\n    ...UserClientEdgeResolver\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fe9d1d04537877d59f4905abc58c777f";
}

module.exports = ((node/*: any*/)/*: Query<
  ResolverGCTestResolverClientEdgeToServerQuery$variables,
  ResolverGCTestResolverClientEdgeToServerQuery$data,
>*/);
