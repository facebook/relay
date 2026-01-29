/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6e490c8ee9517c5ac85ca1457ee0c07f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { TodoDescription____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql";
import type { TodoModel____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql";
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
import {text as todoDescriptionTextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionTextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionTextResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
import {many_fancy_descriptions_but_some_are_null as todoModelManyFancyDescriptionsButSomeAreNullResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelManyFancyDescriptionsButSomeAreNullResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelManyFancyDescriptionsButSomeAreNullResolverType: (
  __relay_model_instance: TodoModel____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<?TodoDescription>);
import type { TodoDescription } from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
export type RelayResolverModelTestTodoWithNullablePluralFieldQuery$variables = {|
  id: string,
|};
export type RelayResolverModelTestTodoWithNullablePluralFieldQuery$data = {|
  +todo_model: ?{|
    +many_fancy_descriptions_but_some_are_null: ?ReadonlyArray<?{|
      +text: ?string,
    |}>,
  |},
|};
export type RelayResolverModelTestTodoWithNullablePluralFieldQuery = {|
  response: RelayResolverModelTestTodoWithNullablePluralFieldQuery$data,
  variables: RelayResolverModelTestTodoWithNullablePluralFieldQuery$variables,
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
    "name": "RelayResolverModelTestTodoWithNullablePluralFieldQuery",
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
              "kind": "ClientEdgeToClientObject",
              "concreteType": "TodoDescription",
              "modelResolvers": null,
              "backingField": {
                "alias": null,
                "args": null,
                "fragment": {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "TodoModel____relay_model_instance"
                },
                "kind": "RelayResolver",
                "name": "many_fancy_descriptions_but_some_are_null",
                "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').many_fancy_descriptions_but_some_are_null, '__relay_model_instance', true),
                "path": "todo_model.many_fancy_descriptions_but_some_are_null",
                "normalizationInfo": {
                  "kind": "WeakModel",
                  "concreteType": "TodoDescription",
                  "plural": true
                }
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "TodoDescription",
                "kind": "LinkedField",
                "name": "many_fancy_descriptions_but_some_are_null",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "fragment": {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "TodoDescription____relay_model_instance"
                    },
                    "kind": "RelayResolver",
                    "name": "text",
                    "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoDescription').text, '__relay_model_instance', true),
                    "path": "todo_model.many_fancy_descriptions_but_some_are_null.text"
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
    "name": "RelayResolverModelTestTodoWithNullablePluralFieldQuery",
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
              "kind": "ClientEdgeToClientObject",
              "backingField": {
                "name": "many_fancy_descriptions_but_some_are_null",
                "args": null,
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "name": "__relay_model_instance",
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
                    }
                  ],
                  "type": "TodoModel",
                  "abstractKey": null
                },
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "TodoDescription",
                "kind": "LinkedField",
                "name": "many_fancy_descriptions_but_some_are_null",
                "plural": true,
                "selections": [
                  {
                    "name": "text",
                    "args": null,
                    "fragment": {
                      "kind": "InlineFragment",
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "__relay_model_instance",
                          "storageKey": null
                        }
                      ],
                      "type": "TodoDescription",
                      "abstractKey": null
                    },
                    "kind": "RelayResolver",
                    "storageKey": null,
                    "isOutputType": true
                  }
                ],
                "storageKey": null
              }
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "39e6653a694196b5a328171cb82b3478",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestTodoWithNullablePluralFieldQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d015c8ed1077211af8500b2437094101";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestTodoWithNullablePluralFieldQuery$variables,
  RelayResolverModelTestTodoWithNullablePluralFieldQuery$data,
>*/);
