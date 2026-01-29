/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<bfc9a21befee134338f900b24cbc9e63>>
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
import type { TodoBlockedByResolverFragment$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoBlockedByResolverFragment.graphql";
import {todo as queryTodoResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodo.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryTodoResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodoResolverType: (
  args: {|
    todoID: string,
  |},
  context: TestResolverContextType,
) => LiveState<?Query__todo$normalization>);
import {blocked_by as todoBlockedByResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoBlockedByResolver.js";
// Type assertion validating that `todoBlockedByResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoBlockedByResolverType: (
  rootKey: TodoBlockedByResolverFragment$key,
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<?Todo__blocked_by$normalization>);
import type { Query__todo$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__todo$normalization.graphql";
import type { Todo__blocked_by$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Todo__blocked_by$normalization.graphql";
export type RelayResolversWithOutputTypeTestTodoWithBlockedQuery$variables = {|
  id: string,
|};
export type RelayResolversWithOutputTypeTestTodoWithBlockedQuery$data = {|
  +todo: ?{|
    +blocked_by: ?ReadonlyArray<?{|
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
    "name": "RelayResolversWithOutputTypeTestTodoWithBlockedQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "Todo",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "todo",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/QueryTodo').todo,
          "path": "todo",
          "normalizationInfo": {
            "kind": "OutputType",
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
              "modelResolvers": null,
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
                "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/TodoBlockedByResolver').blocked_by,
                "path": "todo.blocked_by",
                "normalizationInfo": {
                  "kind": "OutputType",
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
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "todo",
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
          "name": "todo",
          "plural": false,
          "selections": [
            {
              "kind": "ClientEdgeToClientObject",
              "backingField": {
                "name": "blocked_by",
                "args": null,
                "fragment": (v2/*: any*/),
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
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
          ],
          "storageKey": null
        }
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
