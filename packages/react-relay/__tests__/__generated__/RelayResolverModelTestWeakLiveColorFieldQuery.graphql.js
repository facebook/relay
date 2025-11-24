/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e2c83256c41624dfd711621fe9b766c3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import type { TodoDescription____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql";
import {live_todo_description as queryLiveTodoDescriptionResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryLiveTodoDescriptionResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveTodoDescriptionResolverType: (
  args: {|
    todoID: string,
  |},
  context: TestResolverContextType,
) => LiveState<?TodoDescription>);
import {live_color as todoDescriptionLiveColorResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionLiveColorResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionLiveColorResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => LiveState<?unknown>);
import {text as todoDescriptionTextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionTextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionTextResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
import type { TodoDescription } from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
export type RelayResolverModelTestWeakLiveColorFieldQuery$variables = {|
  id: string,
|};
export type RelayResolverModelTestWeakLiveColorFieldQuery$data = {|
  +live_todo_description: ?{|
    +live_color: ?ReturnType<ReturnType<typeof todoDescriptionLiveColorResolverType>["read"]>,
    +text: ?string,
  |},
|};
export type RelayResolverModelTestWeakLiveColorFieldQuery = {|
  response: RelayResolverModelTestWeakLiveColorFieldQuery$data,
  variables: RelayResolverModelTestWeakLiveColorFieldQuery$variables,
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
  "args": null,
  "kind": "FragmentSpread",
  "name": "TodoDescription____relay_model_instance"
},
v3 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverModelTestWeakLiveColorFieldQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "TodoDescription",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "live_todo_description",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').live_todo_description,
          "path": "live_todo_description",
          "normalizationInfo": {
            "kind": "WeakModel",
            "concreteType": "TodoDescription",
            "plural": false
          }
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "TodoDescription",
          "kind": "LinkedField",
          "name": "live_todo_description",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "fragment": (v2/*: any*/),
              "kind": "RelayResolver",
              "name": "text",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoDescription').text, '__relay_model_instance', true),
              "path": "live_todo_description.text"
            },
            {
              "alias": null,
              "args": null,
              "fragment": (v2/*: any*/),
              "kind": "RelayLiveResolver",
              "name": "live_color",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoDescription').live_color, '__relay_model_instance', true),
              "path": "live_todo_description.live_color"
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
    "name": "RelayResolverModelTestWeakLiveColorFieldQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "live_todo_description",
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "TodoDescription",
          "kind": "LinkedField",
          "name": "live_todo_description",
          "plural": false,
          "selections": [
            {
              "name": "text",
              "args": null,
              "fragment": (v3/*: any*/),
              "kind": "RelayResolver",
              "storageKey": null,
              "isOutputType": true
            },
            {
              "name": "live_color",
              "args": null,
              "fragment": (v3/*: any*/),
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
    "cacheID": "570571bca08d9088ff64f650056a75de",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestWeakLiveColorFieldQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b69347659fd3f00f15e9eae940b57f60";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestWeakLiveColorFieldQuery$variables,
  RelayResolverModelTestWeakLiveColorFieldQuery$data,
>*/);
