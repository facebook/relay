/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<dee476dfe769a8a97bcbfeac2b5a49a8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { TodoModel____relay_model_instance$data } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql";
import {edge_to_plural_live_objects_none_exist as queryEdgeToPluralLiveObjectsNoneExistResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryEdgeToPluralLiveObjectsNoneExistResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryEdgeToPluralLiveObjectsNoneExistResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<?{|
  +id: DataID,
|}>);
import {description as todoModelDescriptionResolverType} from "../../../relay-runtime/store/__tests__/resolvers/TodoModel.js";
// Type assertion validating that `todoModelDescriptionResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(todoModelDescriptionResolverType: (
  __relay_model_instance: TodoModel____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query$variables = {||};
export type RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query$data = {|
  +edge_to_plural_live_objects_none_exist: ?ReadonlyArray<?{|
    +description: ?string,
    +id: string,
  |}>,
|};
export type RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query = {|
  response: RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query$data,
  variables: RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query$variables,
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
    "name": "RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query",
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
            "path": "edge_to_plural_live_objects_none_exist.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "edge_to_plural_live_objects_none_exist",
          "resolverModule": require('../RelayResolverNullableModelClientEdge-test').edge_to_plural_live_objects_none_exist,
          "path": "edge_to_plural_live_objects_none_exist"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "TodoModel",
          "kind": "LinkedField",
          "name": "edge_to_plural_live_objects_none_exist",
          "plural": true,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "TodoModel____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "description",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel____relay_model_instance.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').description, '__relay_model_instance', true),
              "path": "edge_to_plural_live_objects_none_exist.description"
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
    "name": "RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "edge_to_plural_live_objects_none_exist",
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
          "name": "edge_to_plural_live_objects_none_exist",
          "plural": true,
          "selections": [
            (v0/*: any*/),
            {
              "name": "description",
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
            }
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "2cf8306cf86529bf2fddf425e1816af4",
    "id": null,
    "metadata": {},
    "name": "RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "99ff4eeb2e8eb3dfaed38852f3d2c70f";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query$variables,
  RelayResolverNullableModelClientEdgeTest_PluralLiveModelNoneExist_Query$data,
>*/);
