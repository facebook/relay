/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<264224bcbf3cac18840f289171287825>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import {edge_to_model_that_throws as queryEdgeToModelThatThrowsResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryEdgeToModelThatThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryEdgeToModelThatThrowsResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type RelayResolverNullableModelClientEdgeTest_ErrorModel_Query$variables = {||};
export type RelayResolverNullableModelClientEdgeTest_ErrorModel_Query$data = {|
  +edge_to_model_that_throws: ?{|
    +__typename: "ErrorModel",
  |},
|};
export type RelayResolverNullableModelClientEdgeTest_ErrorModel_Query = {|
  response: RelayResolverNullableModelClientEdgeTest_ErrorModel_Query$data,
  variables: RelayResolverNullableModelClientEdgeTest_ErrorModel_Query$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverNullableModelClientEdgeTest_ErrorModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "ErrorModel",
        "modelResolvers": {
          "ErrorModel": {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "ErrorModel__id"
            },
            "kind": "RelayResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./ErrorModel__id.graphql'), require('../RelayResolverNullableModelClientEdge-test').ErrorModel, 'id', true),
            "path": "edge_to_model_that_throws.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "edge_to_model_that_throws",
          "resolverModule": require('../RelayResolverNullableModelClientEdge-test').edge_to_model_that_throws,
          "path": "edge_to_model_that_throws"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "ErrorModel",
          "kind": "LinkedField",
          "name": "edge_to_model_that_throws",
          "plural": false,
          "selections": [
            (v0/*: any*/)
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
    "name": "RelayResolverNullableModelClientEdgeTest_ErrorModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "edge_to_model_that_throws",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "ErrorModel",
          "kind": "LinkedField",
          "name": "edge_to_model_that_throws",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "id",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "02171c2b441215a36b86b1d18bed6511",
    "id": null,
    "metadata": {},
    "name": "RelayResolverNullableModelClientEdgeTest_ErrorModel_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ebe9a87123ffc5546caeba534e71db9b";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverNullableModelClientEdgeTest_ErrorModel_Query$variables,
  RelayResolverNullableModelClientEdgeTest_ErrorModel_Query$data,
>*/);
