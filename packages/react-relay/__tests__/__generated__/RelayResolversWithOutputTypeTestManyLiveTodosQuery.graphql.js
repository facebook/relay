/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0df017f62e79dce8d709bee83a912239>>
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
import {many_live_todos as queryManyLiveTodosResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryManyLiveTodos.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryManyLiveTodosResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryManyLiveTodosResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?ReadonlyArray<?Query__many_live_todos$normalization>>);
import type { Query__many_live_todos$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__many_live_todos$normalization.graphql";
export type RelayResolversWithOutputTypeTestManyLiveTodosQuery$variables = {||};
export type RelayResolversWithOutputTypeTestManyLiveTodosQuery$data = {|
  +many_live_todos: ?ReadonlyArray<?{|
    +$fragmentSpreads: RelayResolversWithOutputTypeTestFragment$fragmentType,
  |}>,
|};
export type RelayResolversWithOutputTypeTestManyLiveTodosQuery = {|
  response: RelayResolversWithOutputTypeTestManyLiveTodosQuery$data,
  variables: RelayResolversWithOutputTypeTestManyLiveTodosQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
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
    "name": "RelayResolversWithOutputTypeTestManyLiveTodosQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "Todo",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "many_live_todos",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/QueryManyLiveTodos').many_live_todos,
          "path": "many_live_todos",
          "normalizationInfo": {
            "kind": "OutputType",
            "concreteType": "Todo",
            "plural": true,
            "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__many_live_todos$normalization.graphql')
          }
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "Todo",
          "kind": "LinkedField",
          "name": "many_live_todos",
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResolversWithOutputTypeTestManyLiveTodosQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "many_live_todos",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "Todo",
          "kind": "LinkedField",
          "name": "many_live_todos",
          "plural": true,
          "selections": [
            {
              "kind": "ClientEdgeToClientObject",
              "backingField": {
                "name": "text",
                "args": null,
                "fragment": (v0/*: any*/),
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
              "fragment": (v0/*: any*/),
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
    "cacheID": "b9aabe2c5911f0a5daf91a73d666b31c",
    "id": null,
    "metadata": {},
    "name": "RelayResolversWithOutputTypeTestManyLiveTodosQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f42ffca5f81738e839984490939acc31";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolversWithOutputTypeTestManyLiveTodosQuery$variables,
  RelayResolversWithOutputTypeTestManyLiveTodosQuery$data,
>*/);
