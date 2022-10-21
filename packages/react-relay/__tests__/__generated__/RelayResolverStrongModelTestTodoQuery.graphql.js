/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<ab9874c4fadbaa9f97a9a762efed188d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResolverStrongModelTestFragment$fragmentType } from "./RelayResolverStrongModelTestFragment.graphql";
import {todo_model as queryTodoModelResolver} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel.js";
// Type assertion validating that `queryTodoModelResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodoModelResolver: (
  args: {|
    todoID: string,
  |}, 
) => mixed);
export type RelayResolverStrongModelTestTodoQuery$variables = {|
  id: string,
|};
export type RelayResolverStrongModelTestTodoQuery$data = {|
  +todo_model: ?{|
    +$fragmentSpreads: RelayResolverStrongModelTestFragment$fragmentType,
  |},
|};
export type RelayResolverStrongModelTestTodoQuery = {|
  response: RelayResolverStrongModelTestTodoQuery$data,
  variables: RelayResolverStrongModelTestTodoQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
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
    "name": "todoID",
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
    "name": "RelayResolverStrongModelTestTodoQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "TodoModel",
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "todo_model",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel').todo_model,
          "path": "todo_model"
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "TodoModel",
          "kind": "LinkedField",
          "name": "todo_model",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolverStrongModelTestFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResolverStrongModelTestTodoQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "todo_model",
            "args": (v1/*: any*/),
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "d635bb2b5977ffe4d18bb4a0344f3284",
    "id": null,
    "metadata": {},
    "name": "RelayResolverStrongModelTestTodoQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5e2d0bc4de4f3c8382467eb1c9fdc6df";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverStrongModelTestTodoQuery$variables,
  RelayResolverStrongModelTestTodoQuery$data,
>*/);
