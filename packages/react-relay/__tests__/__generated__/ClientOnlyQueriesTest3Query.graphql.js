/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d90ecf4f73501d47cf0978344dc6d985>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import queryHelloUserResolver from "../../../relay-runtime/store/__tests__/resolvers/HelloUserResolver.js";
// Type assertion validating that `queryHelloUserResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryHelloUserResolver: (
  args: {|
    id: string,
  |}, 
) => mixed);
export type ClientOnlyQueriesTest3Query$variables = {||};
export type ClientOnlyQueriesTest3Query$data = {|
  +hello_user: ?{|
    +name: ?string,
  |},
|};
export type ClientOnlyQueriesTest3Query = {|
  response: ClientOnlyQueriesTest3Query$data,
  variables: ClientOnlyQueriesTest3Query$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "4"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ClientOnlyQueriesTest3Query",
    "selections": [
      {
        "kind": "ClientEdgeToServerObject",
        "operation": require('./ClientEdgeQuery_ClientOnlyQueriesTest3Query_hello_user.graphql'),
        "backingField": {
          "alias": null,
          "args": (v0/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "hello_user",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/HelloUserResolver.js'),
          "path": "hello_user"
        },
        "linkedField": {
          "alias": null,
          "args": (v0/*: any*/),
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "hello_user",
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
          "storageKey": "hello_user(id:\"4\")"
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
    "name": "ClientOnlyQueriesTest3Query",
    "selections": [
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
    ]
  },
  "params": {
    "cacheID": "c0b1f496196ba70c283176143dc0780d",
    "id": null,
    "metadata": {},
    "name": "ClientOnlyQueriesTest3Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f39e561157fa607bf64e77aad228aa05";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ClientOnlyQueriesTest3Query$variables,
  ClientOnlyQueriesTest3Query$data,
>*/);
