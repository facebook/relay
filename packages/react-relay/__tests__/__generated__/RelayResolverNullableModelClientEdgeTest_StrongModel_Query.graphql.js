/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3387d6019d487ace12a8690a20e2e40e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { StrongModel____relay_model_instance$data } from "./StrongModel____relay_model_instance.graphql";
import {edge_to_strong_model_does_not_exist as queryEdgeToStrongModelDoesNotExistResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryEdgeToStrongModelDoesNotExistResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryEdgeToStrongModelDoesNotExistResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
import {name as strongModelNameResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
// Type assertion validating that `strongModelNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(strongModelNameResolverType: (
  __relay_model_instance: StrongModel____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayResolverNullableModelClientEdgeTest_StrongModel_Query$variables = {||};
export type RelayResolverNullableModelClientEdgeTest_StrongModel_Query$data = {|
  +edge_to_strong_model_does_not_exist: ?{|
    +name: ?string,
  |},
|};
export type RelayResolverNullableModelClientEdgeTest_StrongModel_Query = {|
  response: RelayResolverNullableModelClientEdgeTest_StrongModel_Query$data,
  variables: RelayResolverNullableModelClientEdgeTest_StrongModel_Query$variables,
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
    "name": "RelayResolverNullableModelClientEdgeTest_StrongModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "StrongModel",
        "modelResolvers": {
          "StrongModel": {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "StrongModel__id"
            },
            "kind": "RelayResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./StrongModel__id.graphql'), require('../RelayResolverNullableModelClientEdge-test').StrongModel, 'id', true),
            "path": "edge_to_strong_model_does_not_exist.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "edge_to_strong_model_does_not_exist",
          "resolverModule": require('../RelayResolverNullableModelClientEdge-test').edge_to_strong_model_does_not_exist,
          "path": "edge_to_strong_model_does_not_exist"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "StrongModel",
          "kind": "LinkedField",
          "name": "edge_to_strong_model_does_not_exist",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "StrongModel____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "name",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./StrongModel____relay_model_instance.graphql'), require('../RelayResolverNullableModelClientEdge-test').name, '__relay_model_instance', true),
              "path": "edge_to_strong_model_does_not_exist.name"
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
    "name": "RelayResolverNullableModelClientEdgeTest_StrongModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "edge_to_strong_model_does_not_exist",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "StrongModel",
          "kind": "LinkedField",
          "name": "edge_to_strong_model_does_not_exist",
          "plural": false,
          "selections": [
            {
              "name": "name",
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
                      "type": "StrongModel",
                      "abstractKey": null
                    },
                    "kind": "RelayResolver",
                    "storageKey": null,
                    "isOutputType": false
                  }
                ],
                "type": "StrongModel",
                "abstractKey": null
              },
              "kind": "RelayResolver",
              "storageKey": null,
              "isOutputType": true
            },
            (v0/*: any*/)
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "acb5dbbcdb10b8c23559acfa09470a62",
    "id": null,
    "metadata": {},
    "name": "RelayResolverNullableModelClientEdgeTest_StrongModel_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "22ad42880cde32f3213c37be50f8dadd";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverNullableModelClientEdgeTest_StrongModel_Query$variables,
  RelayResolverNullableModelClientEdgeTest_StrongModel_Query$data,
>*/);
