/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b84552aa7b56781b87c2e54664766888>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { RelayResolversWithOutputTypeTestFragment$fragmentType } from "./RelayResolversWithOutputTypeTestFragment.graphql";
import {todos as queryTodosResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodos.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryTodosResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodosResolverType: (
  args: {|
    first: ?number,
    last: ?number,
  |},
  context: TestResolverContextType,
) => LiveState<?Query__todos$normalization>);
import type { Query__todos$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__todos$normalization.graphql";
export type RelayResolversWithOutputTypeTestExceptionalProjectQuery$variables = {||};
export type RelayResolversWithOutputTypeTestExceptionalProjectQuery$data = {|
  +todos: ?{|
    +edges: ?ReadonlyArray<?{|
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
],
v1 = {
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
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": (v0/*: any*/),
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "todos",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/QueryTodos').todos,
          "path": "todos",
          "normalizationInfo": {
            "kind": "OutputType",
            "concreteType": "TodoConnection",
            "plural": false,
            "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__todos$normalization.graphql')
          }
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
    "name": "RelayResolversWithOutputTypeTestExceptionalProjectQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "todos",
          "args": (v0/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": "todos(first:10)",
          "isOutputType": true
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
                      "kind": "ClientEdgeToClientObject",
                      "backingField": {
                        "name": "text",
                        "args": null,
                        "fragment": (v1/*: any*/),
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
                      "fragment": (v1/*: any*/),
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
          "storageKey": "todos(first:10)"
        }
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
