/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aa81d50f15f03c8929da42bd8fc23303>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResolverModelTestFragment$fragmentType } from "./RelayResolverModelTestFragment.graphql";
import {todo_model as queryTodoModelResolver} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel.js";
// Type assertion validating that `queryTodoModelResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodoModelResolver: (
  args: {|
    todoID: string,
  |}, 
) => mixed);
export type RelayResolverModelTestTodoQuery$variables = {|
  id: string,
|};
export type RelayResolverModelTestTodoQuery$data = {|
  +todo_model: ?{|
    +$fragmentSpreads: RelayResolverModelTestFragment$fragmentType,
  |},
|};
export type RelayResolverModelTestTodoQuery = {|
  response: RelayResolverModelTestTodoQuery$data,
  variables: RelayResolverModelTestTodoQuery$variables,
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
    "name": "RelayResolverModelTestTodoQuery",
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
              "name": "RelayResolverModelTestFragment"
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
    "name": "RelayResolverModelTestTodoQuery",
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
    "cacheID": "2038b2cef168130bb00fa9874b879379",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestTodoQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b207dfaaed084f7ca220cc00816a3ed0";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestTodoQuery$variables,
  RelayResolverModelTestTodoQuery$data,
>*/);
