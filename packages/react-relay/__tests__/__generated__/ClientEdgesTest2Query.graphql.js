/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0a4203e6a549343a8efede75168d8328>>
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
export type ClientEdgesTest2Query$variables = {|
  id: string,
|};
export type ClientEdgesTest2Query$data = {|
  +me: ?{|
    +client_node: ?{|
      +name?: ?string,
    |},
  |},
|};
export type ClientEdgesTest2Query = {|
  response: ClientEdgesTest2Query$data,
  variables: ClientEdgesTest2Query$variables,
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
    "name": "ClientEdgesTest2Query",
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
            "operation": require('./ClientEdgeQuery_ClientEdgesTest2Query_me__client_node.graphql'),
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
    "name": "ClientEdgesTest2Query",
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
    "cacheID": "e05d01bfdda30ecc1de8aec45abf1bf8",
    "id": null,
    "metadata": {},
    "name": "ClientEdgesTest2Query",
    "operationKind": "query",
    "text": "query ClientEdgesTest2Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "eba9115dcb295cf32d8aacc9a815da6b";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgesTest2Query$variables,
  ClientEdgesTest2Query$data,
>*/);
