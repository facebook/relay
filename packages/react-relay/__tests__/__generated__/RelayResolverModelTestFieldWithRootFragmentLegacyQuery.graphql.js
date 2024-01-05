/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<eb11e21205e629c4cefd4b2bd5723324>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { TodoModelCapitalizedIDLegacy$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModelCapitalizedIDLegacy.graphql";
import {todo_model as queryTodoModelResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel.js";
// Type assertion validating that `queryTodoModelResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodoModelResolverType: (
  args: {|
    todoID: string,
  |},
) => ?{|
  +id: DataID,
|});
import {capitalized_id_legacy as todoModelCapitalizedIdLegacyResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelCapitalizedIdLegacyResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelCapitalizedIdLegacyResolverType: (
  rootKey: TodoModelCapitalizedIDLegacy$key,
) => ?mixed);
export type RelayResolverModelTestFieldWithRootFragmentLegacyQuery$variables = {|
  id: string,
|};
export type RelayResolverModelTestFieldWithRootFragmentLegacyQuery$data = {|
  +todo_model: ?{|
    +capitalized_id_legacy: ?ReturnType<typeof todoModelCapitalizedIdLegacyResolverType>,
  |},
|};
export type RelayResolverModelTestFieldWithRootFragmentLegacyQuery = {|
  response: RelayResolverModelTestFieldWithRootFragmentLegacyQuery$data,
  variables: RelayResolverModelTestFieldWithRootFragmentLegacyQuery$variables,
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
    "name": "RelayResolverModelTestFieldWithRootFragmentLegacyQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "TodoModel",
        "modelResolver": {
          "alias": null,
          "args": [],
          "fragment": {
            "args": null,
            "kind": "FragmentSpread",
            "name": "TodoModel__id"
          },
          "kind": "RelayLiveResolver",
          "name": "todo_model",
          "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__id.graphql'), require('./../../../relay-runtime/store/__tests__/resolvers/TodoModel').TodoModel, 'id', true),
          "path": "todo_model.__relay_model_instance"
        },
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
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "TodoModelCapitalizedIDLegacy"
              },
              "kind": "RelayResolver",
              "name": "capitalized_id_legacy",
              "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/TodoModel').capitalized_id_legacy,
              "path": "todo_model.capitalized_id_legacy"
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
    "name": "RelayResolverModelTestFieldWithRootFragmentLegacyQuery",
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
              "name": "capitalized_id_legacy",
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
              "isOutputType": false
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "f3f20658365422d00657b857562271d6",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestFieldWithRootFragmentLegacyQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6f12681d0454d3c2f6c9ecf245085a85";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestFieldWithRootFragmentLegacyQuery$variables,
  RelayResolverModelTestFieldWithRootFragmentLegacyQuery$data,
>*/);
