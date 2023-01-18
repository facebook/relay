/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<47bbc8876ce03ce28afbb6e15b4e3ef3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResolverModelTestInterfaceFragment$fragmentType } from "./RelayResolverModelTestInterfaceFragment.graphql";
import {todo_model as queryTodoModelResolver} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel.js";
// Type assertion validating that `queryTodoModelResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodoModelResolver: (
  args: {|
    todoID: string,
  |}, 
) => mixed);
export type RelayResolverModelTestTodoWithInterfaceQuery$variables = {|
  id: string,
|};
export type RelayResolverModelTestTodoWithInterfaceQuery$data = {|
  +todo_model: ?{|
    +$fragmentSpreads: RelayResolverModelTestInterfaceFragment$fragmentType,
  |},
|};
export type RelayResolverModelTestTodoWithInterfaceQuery = {|
  response: RelayResolverModelTestTodoWithInterfaceQuery$data,
  variables: RelayResolverModelTestTodoWithInterfaceQuery$variables,
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
    "name": "RelayResolverModelTestTodoWithInterfaceQuery",
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
              "name": "RelayResolverModelTestInterfaceFragment"
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
    "name": "RelayResolverModelTestTodoWithInterfaceQuery",
    "selections": [
      {
        "name": "todo_model",
        "args": (v1/*: any*/),
        "fragment": null,
        "kind": "RelayResolver",
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "7db3bd26ebae6aa35ff94c31e5efa078",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestTodoWithInterfaceQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a8b583e7d4f18358def854c5ee431bba";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestTodoWithInterfaceQuery$variables,
  RelayResolverModelTestTodoWithInterfaceQuery$data,
>*/);
