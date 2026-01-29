/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4d0c48c1712a5e0c8a0662becaea11ac>>
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
import {edge_to_live_object_does_not_exist as queryEdgeToLiveObjectDoesNotExistResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryEdgeToLiveObjectDoesNotExistResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryEdgeToLiveObjectDoesNotExistResolverType: (
  args: void,
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
import {fancy_description as todoModelFancyDescriptionResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelFancyDescriptionResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelFancyDescriptionResolverType: (
  __relay_model_instance: TodoModel____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?TodoDescription);
import type { TodoDescription } from "../../../relay-runtime/store/__tests__/resolvers/TodoDescription.js";
export type RelayResolverNullableModelClientEdgeTest_LiveModel_Query$variables = {||};
export type RelayResolverNullableModelClientEdgeTest_LiveModel_Query$data = {|
  +edge_to_live_object_does_not_exist: ?{|
    +fancy_description: ?{|
      +text: ?string,
    |},
    +id: string,
  |},
|};
export type RelayResolverNullableModelClientEdgeTest_LiveModel_Query = {|
  response: RelayResolverNullableModelClientEdgeTest_LiveModel_Query$data,
  variables: RelayResolverNullableModelClientEdgeTest_LiveModel_Query$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverNullableModelClientEdgeTest_LiveModel_Query",
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
            "path": "edge_to_live_object_does_not_exist.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "edge_to_live_object_does_not_exist",
          "resolverModule": require('../RelayResolverNullableModelClientEdge-test').edge_to_live_object_does_not_exist,
          "path": "edge_to_live_object_does_not_exist"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "TodoModel",
          "kind": "LinkedField",
          "name": "edge_to_live_object_does_not_exist",
          "plural": false,
          "selections": [
            (v0/*: any*/),
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
                "name": "fancy_description",
                "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').fancy_description, '__relay_model_instance', true),
                "path": "edge_to_live_object_does_not_exist.fancy_description",
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
                "name": "fancy_description",
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
                    "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoDescription____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoDescription').text, '__relay_model_instance', true),
                    "path": "edge_to_live_object_does_not_exist.fancy_description.text"
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResolverNullableModelClientEdgeTest_LiveModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "edge_to_live_object_does_not_exist",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "TodoModel",
          "kind": "LinkedField",
          "name": "edge_to_live_object_does_not_exist",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "kind": "ClientEdgeToClientObject",
              "backingField": {
                "name": "fancy_description",
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
                          (v0/*: any*/)
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
                "name": "fancy_description",
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
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "ffc0723de59b6960e0ea5a5599142177",
    "id": null,
    "metadata": {},
    "name": "RelayResolverNullableModelClientEdgeTest_LiveModel_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "37156528a49b790efe6451531de61ea5";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverNullableModelClientEdgeTest_LiveModel_Query$variables,
  RelayResolverNullableModelClientEdgeTest_LiveModel_Query$data,
>*/);
