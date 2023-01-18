/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8ba13a0c985e286afd964b598e5a1c9c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { RelayResolversWithOutputTypeTestFragment$fragmentType } from "./RelayResolversWithOutputTypeTestFragment.graphql";
import type { TodoBlockedByResolverFragment$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoBlockedByResolverFragment.graphql";
import {todo as queryTodoResolver} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodo.js";
// Type assertion validating that `queryTodoResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodoResolver: (
  args: {|
    todoID: string,
  |}, 
) => LiveState<?Query__todo$normalization>);
import {blocked_by as todoBlockedByResolver} from "../../../relay-runtime/store/__tests__/resolvers/TodoBlockedByResolver.js";
// Type assertion validating that `todoBlockedByResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoBlockedByResolver: (
  rootKey: TodoBlockedByResolverFragment$key, 
) => $ReadOnlyArray<?Todo__blocked_by$normalization>);
import type { Query__todo$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__todo$normalization.graphql";
import type { Todo__blocked_by$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Todo__blocked_by$normalization.graphql";
export type RelayResolversWithOutputTypeTestTodoWithBlockedQuery$variables = {|
  id: string,
|};
export type RelayResolversWithOutputTypeTestTodoWithBlockedQuery$data = {|
  +todo: ?{|
    +blocked_by: ?$ReadOnlyArray<?{|
      +$fragmentSpreads: RelayResolversWithOutputTypeTestFragment$fragmentType,
    |}>,
  |},
|};
export type RelayResolversWithOutputTypeTestTodoWithBlockedQuery = {|
  response: RelayResolversWithOutputTypeTestTodoWithBlockedQuery$data,
  variables: RelayResolversWithOutputTypeTestTodoWithBlockedQuery$variables,
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
    "name": "RelayResolversWithOutputTypeTestTodoWithBlockedQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "Todo",
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "todo",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/QueryTodo').todo,
          "path": "todo",
          "normalizationInfo": {
            "concreteType": "Todo",
            "plural": false,
            "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__todo$normalization.graphql')
          }
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "Todo",
          "kind": "LinkedField",
          "name": "todo",
          "plural": false,
          "selections": [
            {
              "kind": "ClientEdgeToClientObject",
              "concreteType": "Todo",
              "backingField": {
                "alias": null,
                "args": null,
                "fragment": {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "TodoBlockedByResolverFragment"
                },
                "kind": "RelayResolver",
                "name": "blocked_by",
                "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/TodoBlockedByResolver').blocked_by,
                "path": "blocked_by",
                "normalizationInfo": {
                  "concreteType": "Todo",
                  "plural": true,
                  "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Todo__blocked_by$normalization.graphql')
                }
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "Todo",
                "kind": "LinkedField",
                "name": "blocked_by",
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
    "name": "RelayResolversWithOutputTypeTestTodoWithBlockedQuery",
    "selections": [
      {
        "name": "todo",
        "args": (v1/*: any*/),
        "fragment": null,
        "kind": "RelayResolver",
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4b9c49655b05ea603023dada88ea2895",
    "id": null,
    "metadata": {},
    "name": "RelayResolversWithOutputTypeTestTodoWithBlockedQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d5a707f4998bc00708ebdfeb8a168508";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolversWithOutputTypeTestTodoWithBlockedQuery$variables,
  RelayResolversWithOutputTypeTestTodoWithBlockedQuery$data,
>*/);
