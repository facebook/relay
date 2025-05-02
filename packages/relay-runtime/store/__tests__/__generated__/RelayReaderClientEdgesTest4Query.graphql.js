/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<83279bcac3598c8eadc0729662f83169>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { UserAnotherClientEdgeResolver$key } from "./../resolvers/__generated__/UserAnotherClientEdgeResolver.graphql";
import type { UserClientEdgeResolver$key } from "./../resolvers/__generated__/UserClientEdgeResolver.graphql";
import {another_client_edge as userAnotherClientEdgeResolverType} from "../resolvers/UserAnotherClientEdgeResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userAnotherClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAnotherClientEdgeResolverType: (
  rootKey: UserAnotherClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
import {client_edge as userClientEdgeResolverType} from "../resolvers/UserClientEdgeResolver.js";
// Type assertion validating that `userClientEdgeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientEdgeResolverType: (
  rootKey: UserClientEdgeResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type RelayReaderClientEdgesTest4Query$variables = {||};
export type RelayReaderClientEdgesTest4Query$data = {|
  +me: ?{|
    +client_edge: ?{|
      +another_client_edge: ?{|
        +name: ?string,
      |},
    |},
  |},
|};
export type RelayReaderClientEdgesTest4Query = {|
  response: RelayReaderClientEdgesTest4Query$data,
  variables: RelayReaderClientEdgesTest4Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayReaderClientEdgesTest4Query",
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
            "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge.graphql'),
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
                  "kind": "ClientEdgeToServerObject",
                  "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTest4Query_me__client_edge__another_client_edge.graphql'),
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
                    "resolverModule": require('../resolvers/UserAnotherClientEdgeResolver').another_client_edge,
                    "path": "me.client_edge.another_client_edge"
                  },
                  "linkedField": {
                    "alias": null,
                    "args": null,
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "another_client_edge",
                    "plural": false,
                    "selections": (v0/*: any*/),
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
    "name": "RelayReaderClientEdgesTest4Query",
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
              "selections": (v0/*: any*/),
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
    "cacheID": "f62a07db0b7d21d85082c75c00ce219c",
    "id": null,
    "metadata": {},
    "name": "RelayReaderClientEdgesTest4Query",
    "operationKind": "query",
    "text": "query RelayReaderClientEdgesTest4Query {\n  me {\n    ...UserClientEdgeResolver\n    id\n  }\n}\n\nfragment UserClientEdgeResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f12dcfffcc6bbf929b4fad3a4eb5602d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderClientEdgesTest4Query$variables,
  RelayReaderClientEdgesTest4Query$data,
>*/);
