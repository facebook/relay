/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<901b8fd57189fc5e4a0080d76337f6ba>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { TodoDescription____relay_model_instance$data } from "./TodoDescription____relay_model_instance.graphql";
import {some_todo_description as querySomeTodoDescriptionResolverType} from "../TodoDescription.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `querySomeTodoDescriptionResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(querySomeTodoDescriptionResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?TodoDescription);
import {text as todoDescriptionTextResolverType} from "../TodoDescription.js";
// Type assertion validating that `todoDescriptionTextResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoDescriptionTextResolverType: (
  __relay_model_instance: TodoDescription____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
import type { TodoDescription } from "../TodoDescription.js";
export type ResolverGCTestWeakQuery$variables = {||};
export type ResolverGCTestWeakQuery$data = {|
  +some_todo_description: ?{|
    +text: ?string,
  |},
|};
export type ResolverGCTestWeakQuery = {|
  response: ResolverGCTestWeakQuery$data,
  variables: ResolverGCTestWeakQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ResolverGCTestWeakQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "TodoDescription",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "some_todo_description",
          "resolverModule": require('../TodoDescription').some_todo_description,
          "path": "some_todo_description",
          "normalizationInfo": {
            "kind": "WeakModel",
            "concreteType": "TodoDescription",
            "plural": false
          }
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "TodoDescription",
          "kind": "LinkedField",
          "name": "some_todo_description",
          "plural": false,
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
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./TodoDescription____relay_model_instance.graphql'), require('../TodoDescription').text, '__relay_model_instance', true),
              "path": "some_todo_description.text"
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
    "name": "ResolverGCTestWeakQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "some_todo_description",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "TodoDescription",
          "kind": "LinkedField",
          "name": "some_todo_description",
          "plural": false,
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
      }
    ]
  },
  "params": {
    "cacheID": "a0cda71979b7590bcf2ef5ec699b0fc7",
    "id": null,
    "metadata": {},
    "name": "ResolverGCTestWeakQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "ae38e15c2c90cdf2adc8892721353400";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ResolverGCTestWeakQuery$variables,
  ResolverGCTestWeakQuery$data,
>*/);
