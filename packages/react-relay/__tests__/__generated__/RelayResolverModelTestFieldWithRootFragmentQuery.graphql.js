/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<258b0f877f9d5363b434e257efc9bd4b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { TodoModelCapitalizedID$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModelCapitalizedID.graphql";
import {todo_model as queryTodoModelResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryTodoModelResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodoModelResolverType: (
  args: {|
    todoID: string,
  |},
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
import {capitalized_id as todoModelCapitalizedIdResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelCapitalizedIdResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelCapitalizedIdResolverType: (
  rootKey: TodoModelCapitalizedID$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayResolverModelTestFieldWithRootFragmentQuery$variables = {|
  id: string,
|};
export type RelayResolverModelTestFieldWithRootFragmentQuery$data = {|
  +todo_model: ?{|
    +capitalized_id: ?string,
  |},
|};
export type RelayResolverModelTestFieldWithRootFragmentQuery = {|
  response: RelayResolverModelTestFieldWithRootFragmentQuery$data,
  variables: RelayResolverModelTestFieldWithRootFragmentQuery$variables,
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
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverModelTestFieldWithRootFragmentQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "TodoModel",
        "modelResolvers": {
          "TodoModel": {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "TodoModel__id"
            },
            "kind": "RelayLiveResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__id.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').TodoModel, 'id', true),
            "path": "todo_model.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "todo_model",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel').todo_model,
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
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "TodoModelCapitalizedID"
              },
              "kind": "RelayResolver",
              "name": "capitalized_id",
              "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').capitalized_id,
              "path": "todo_model.capitalized_id"
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
    "name": "RelayResolverModelTestFieldWithRootFragmentQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "todo_model",
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
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
              "name": "capitalized_id",
              "args": null,
              "fragment": {
                "kind": "InlineFragment",
                "selections": [
                  (v2/*: any*/)
                ],
                "type": "TodoModel",
                "abstractKey": null
              },
              "kind": "RelayResolver",
              "storageKey": null,
              "isOutputType": true
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "2fb513931cd5c8f2e4c1ec5a01ed6081",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestFieldWithRootFragmentQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "63d4f2846eb83fcbc57a5ce5abea136b";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestFieldWithRootFragmentQuery$variables,
  RelayResolverModelTestFieldWithRootFragmentQuery$data,
>*/);
