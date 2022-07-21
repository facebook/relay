/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fef614a00eb51051a4a98d01a0d791b9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userClientNodeResolver from "../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeNodeResolver.js";
// Type assertion validating that `userClientNodeResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientNodeResolver: (
  args: {|
    id: string,
  |}, 
) => mixed);
export type ClientEdgesTest1Query$variables = {|
  id: string,
|};
export type ClientEdgesTest1Query$data = {|
  +me: ?{|
    +client_node: ?{|
      +name?: ?string,
    |},
  |},
|};
export type ClientEdgesTest1Query = {|
  response: ClientEdgesTest1Query$data,
  variables: ClientEdgesTest1Query$variables,
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
    "name": "ClientEdgesTest1Query",
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
            "operation": require('./ClientEdgeQuery_ClientEdgesTest1Query_me__client_node.graphql'),
            "backingField": {
              "alias": null,
              "args": (v1/*: any*/),
              "fragment": null,
              "kind": "RelayResolver",
              "name": "client_node",
              "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/UserClientEdgeNodeResolver'),
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
    "name": "ClientEdgesTest1Query",
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
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "ClientExtension",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__id",
                "storageKey": null
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "be96c6717c5e660108e52e314b021c9b",
    "id": null,
    "metadata": {},
    "name": "ClientEdgesTest1Query",
    "operationKind": "query",
    "text": "query ClientEdgesTest1Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "69d7fa3908eedb4d634799d1252e80a7";
}

module.exports = ((node/*: any*/)/*: Query<
  ClientEdgesTest1Query$variables,
  ClientEdgesTest1Query$data,
>*/);
