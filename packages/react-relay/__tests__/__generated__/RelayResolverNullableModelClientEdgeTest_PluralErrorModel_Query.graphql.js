/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<498ec81ccc8cf51aa234802ccdde2673>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import {edge_to_plural_models_that_throw as queryEdgeToPluralModelsThatThrowResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryEdgeToPluralModelsThatThrowResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryEdgeToPluralModelsThatThrowResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<?{|
  +id: DataID,
|}>);
export type RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query$variables = {||};
export type RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query$data = {|
  +edge_to_plural_models_that_throw: ?ReadonlyArray<?{|
    +__typename: "ErrorModel",
  |}>,
|};
export type RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query = {|
  response: RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query$data,
  variables: RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query$variables,
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
    "name": "RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query",
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
            "path": "edge_to_plural_models_that_throw.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "edge_to_plural_models_that_throw",
          "resolverModule": require('../RelayResolverNullableModelClientEdge-test').edge_to_plural_models_that_throw,
          "path": "edge_to_plural_models_that_throw"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "ErrorModel",
          "kind": "LinkedField",
          "name": "edge_to_plural_models_that_throw",
          "plural": true,
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
    "name": "RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "edge_to_plural_models_that_throw",
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
          "name": "edge_to_plural_models_that_throw",
          "plural": true,
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
    "cacheID": "c6c68a175aa2fcdcab9fc87f69489a4a",
    "id": null,
    "metadata": {},
    "name": "RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "29e63ae02c6f32c751824079e556f81b";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query$variables,
  RelayResolverNullableModelClientEdgeTest_PluralErrorModel_Query$data,
>*/);
