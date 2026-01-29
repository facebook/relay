/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<48d4e4c5398d88f3f134c8ea71eea335>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayResolversWithOutputTypeTestFragment$fragmentType } from "./RelayResolversWithOutputTypeTestFragment.graphql";
import {many_todos as queryManyTodosResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryManyTodos.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryManyTodosResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryManyTodosResolverType: (
  args: {|
    todo_ids: ReadonlyArray<?string>,
  |},
  context: TestResolverContextType,
) => ?ReadonlyArray<?Query__many_todos$normalization>);
import type { Query__many_todos$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__many_todos$normalization.graphql";
export type RelayResolversWithOutputTypeTestManyTodosQuery$variables = {|
  todos: ReadonlyArray<?string>,
|};
export type RelayResolversWithOutputTypeTestManyTodosQuery$data = {|
  +many_todos: ?ReadonlyArray<?{|
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
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "name": "self",
      "args": null,
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "todo_id",
            "storageKey": null
          }
        ],
        "type": "Todo",
        "abstractKey": null
      },
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": true
    }
  ],
  "type": "Todo",
  "abstractKey": null
};
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
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "many_todos",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/QueryManyTodos').many_todos,
          "path": "many_todos",
          "normalizationInfo": {
            "kind": "OutputType",
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
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "many_todos",
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
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
              "kind": "ClientEdgeToClientObject",
              "backingField": {
                "name": "text",
                "args": null,
                "fragment": (v2/*: any*/),
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "TodoText",
                "kind": "LinkedField",
                "name": "text",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "content",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "TodoTextStyle",
                    "kind": "LinkedField",
                    "name": "style",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "font_style",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "TodoTextColor",
                        "kind": "LinkedField",
                        "name": "color",
                        "plural": false,
                        "selections": [
                          {
                            "name": "human_readable_color",
                            "args": null,
                            "fragment": {
                              "kind": "InlineFragment",
                              "selections": [
                                {
                                  "alias": null,
                                  "args": null,
                                  "kind": "ScalarField",
                                  "name": "hex",
                                  "storageKey": null
                                }
                              ],
                              "type": "TodoTextColor",
                              "abstractKey": null
                            },
                            "kind": "RelayResolver",
                            "storageKey": null,
                            "isOutputType": true
                          }
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            },
            {
              "name": "complete",
              "args": null,
              "fragment": (v2/*: any*/),
              "kind": "RelayResolver",
              "storageKey": null,
              "isOutputType": true
            }
          ],
          "storageKey": null
        }
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
