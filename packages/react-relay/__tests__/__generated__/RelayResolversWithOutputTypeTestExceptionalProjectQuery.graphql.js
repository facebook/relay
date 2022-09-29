/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7dc568a653144073f51c0cc7a94e11b5>>
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
import queryTodosResolver from "../../../relay-runtime/store/__tests__/resolvers/QueryTodos.js";
// Type assertion validating that `queryTodosResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodosResolver: (
  args: {|
    first: ?number,
    last: ?number,
  |}, 
) => LiveState<any>);
export type RelayResolversWithOutputTypeTestExceptionalProjectQuery$variables = {||};
export type RelayResolversWithOutputTypeTestExceptionalProjectQuery$data = {|
  +todos: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +$fragmentSpreads: RelayResolversWithOutputTypeTestFragment$fragmentType,
      |},
    |}>,
  |},
|};
export type RelayResolversWithOutputTypeTestExceptionalProjectQuery = {|
  response: RelayResolversWithOutputTypeTestExceptionalProjectQuery$data,
  variables: RelayResolversWithOutputTypeTestExceptionalProjectQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolversWithOutputTypeTestExceptionalProjectQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "TodoConnection",
        "backingField": {
          "alias": null,
          "args": (v0/*: any*/),
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "todos",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/QueryTodos'),
          "path": "todos"
        },
        "linkedField": {
          "alias": null,
          "args": (v0/*: any*/),
          "concreteType": "TodoConnection",
          "kind": "LinkedField",
          "name": "todos",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "TodoEdge",
              "kind": "LinkedField",
              "name": "edges",
              "plural": true,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "concreteType": "Todo",
                  "kind": "LinkedField",
                  "name": "node",
                  "plural": false,
                  "selections": [
                    {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "RelayResolversWithOutputTypeTestFragment"
                    }
                  ],
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": "todos(first:10)"
        },
        "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__todos$normalization.graphql')
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResolversWithOutputTypeTestExceptionalProjectQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "todos",
            "args": (v0/*: any*/),
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": "todos(first:10)"
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "0ba0cffbb47f5ea0676d201eec9119e1",
    "id": null,
    "metadata": {},
    "name": "RelayResolversWithOutputTypeTestExceptionalProjectQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "dc69884134f2ef69eccce8a9305e9afd";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolversWithOutputTypeTestExceptionalProjectQuery$variables,
  RelayResolversWithOutputTypeTestExceptionalProjectQuery$data,
>*/);
