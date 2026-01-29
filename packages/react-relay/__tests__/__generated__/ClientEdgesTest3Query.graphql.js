/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f688624b4fa8913cf231198e43163065>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import {client_node as userClientNodeResolverType} from "../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeNodeResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientNodeResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientNodeResolverType: (
  args: {|
    id: string,
  |},
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type ClientEdgesTest3Query$variables = {|
  id: string,
|};
export type ClientEdgesTest3Query$data = {|
  +me: ?{|
    +client_node: {|
      +name?: ?string,
    |},
  |},
|};
export type ClientEdgesTest3Query = {|
  response: ClientEdgesTest3Query$data,
  variables: ClientEdgesTest3Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ClientEdgesTest3Query",
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
            "kind": "RequiredField",
            "field": {
              "kind": "ClientEdgeToServerObject",
              "operation": require('./ClientEdgeQuery_ClientEdgesTest3Query_me__client_node.graphql'),
              "backingField": {
                "alias": null,
                "args": (v1/*: any*/),
                "fragment": null,
                "kind": "RelayResolver",
                "name": "client_node",
                "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeNodeResolver').client_node,
                "path": "me.client_node"
              },
              "linkedField": {
                "alias": null,
                "args": (v1/*: any*/),
                "concreteType": null,
                "kind": "LinkedField",
                "name": "client_node",
                "plural": false,
                "selections": [
                  {
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
                  }
                ],
                "storageKey": null
              }
            },
            "action": "THROW"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ClientEdgesTest3Query",
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
            "name": "client_node",
            "args": (v1/*: any*/),
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
    "cacheID": "3972a9748eef642faafd81e456ee2399",
    "id": null,
    "metadata": {},
    "name": "ClientEdgesTest3Query",
    "operationKind": "query",
    "text": "query ClientEdgesTest3Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4834e4d5990c86914b1ca32970e43811";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgesTest3Query$variables,
  ClientEdgesTest3Query$data,
>*/);
