/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0fc1e1e19bc49a255a1c84a7811d3874>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResolversWithOutputTypeTestFragment$fragmentType } from "./RelayResolversWithOutputTypeTestFragment.graphql";
import {many_todos as queryManyTodosResolver} from "../../../relay-runtime/store/__tests__/resolvers/QueryManyTodos.js";
// Type assertion validating that `queryManyTodosResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryManyTodosResolver: (
  args: {|
    todo_ids: $ReadOnlyArray<?string>,
  |}, 
) => $ReadOnlyArray<?Query__many_todos$normalization>);
import type { Query__many_todos$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__many_todos$normalization.graphql";
export type RelayResolversWithOutputTypeTestManyTodosQuery$variables = {|
  todos: $ReadOnlyArray<?string>,
|};
export type RelayResolversWithOutputTypeTestManyTodosQuery$data = {|
  +many_todos: ?$ReadOnlyArray<?{|
    +$fragmentSpreads: RelayResolversWithOutputTypeTestFragment$fragmentType,
  |}>,
|};
export type RelayResolversWithOutputTypeTestManyTodosQuery = {|
  response: RelayResolversWithOutputTypeTestManyTodosQuery$data,
  variables: RelayResolversWithOutputTypeTestManyTodosQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "todos"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "todo_ids",
    "variableName": "todos"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolversWithOutputTypeTestManyTodosQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "Todo",
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "many_todos",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/QueryManyTodos').many_todos,
          "path": "many_todos",
          "normalizationInfo": {
            "concreteType": "Todo",
            "plural": true,
            "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__many_todos$normalization.graphql')
          }
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "Todo",
          "kind": "LinkedField",
          "name": "many_todos",
          "plural": true,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolversWithOutputTypeTestFragment"
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
    "name": "RelayResolversWithOutputTypeTestManyTodosQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "many_todos",
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
    "cacheID": "525d81105f210c93365a0e9aeb4062eb",
    "id": null,
    "metadata": {},
    "name": "RelayResolversWithOutputTypeTestManyTodosQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7bdedb4f9812c93f894c879d33149a2d";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolversWithOutputTypeTestManyTodosQuery$variables,
  RelayResolversWithOutputTypeTestManyTodosQuery$data,
>*/);
