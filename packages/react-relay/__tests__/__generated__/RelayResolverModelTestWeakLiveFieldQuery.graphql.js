/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7fbb57f3d1e3ca63e516660ee802b8dd>>
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
import {color as todoDescriptionColorResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionColorResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionColorResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?unknown);
import {text as todoDescriptionTextResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
// Type assertion validating that `todoDescriptionTextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionTextResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
import type { TodoDescription } from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
export type RelayResolverModelTestWeakLiveFieldQuery$variables = {|
  id: string,
|};
export type RelayResolverModelTestWeakLiveFieldQuery$data = {|
  +live_todo_description: ?{|
    +color: ?ReturnType<typeof todoDescriptionColorResolverType>,
    +text: ?string,
  |},
|};
export type RelayResolverModelTestWeakLiveFieldQuery = {|
  response: RelayResolverModelTestWeakLiveFieldQuery$data,
  variables: RelayResolverModelTestWeakLiveFieldQuery$variables,
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
    "name": "RelayResolverModelTestWeakLiveFieldQuery",
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
              "kind": "RelayResolver",
              "name": "color",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoDescription').color, '__relay_model_instance', true),
              "path": "live_todo_description.color"
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
    "name": "RelayResolverModelTestWeakLiveFieldQuery",
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
              "name": "color",
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
    "cacheID": "20a23dad2084a9bb9138f137a764c9e4",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestWeakLiveFieldQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e3e60c655cd9eed2036fe61aa72f4402";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestWeakLiveFieldQuery$variables,
  RelayResolverModelTestWeakLiveFieldQuery$data,
>*/);
