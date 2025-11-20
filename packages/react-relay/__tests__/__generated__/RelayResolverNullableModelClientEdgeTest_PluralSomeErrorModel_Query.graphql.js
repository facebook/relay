/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<20e7aa82c290b33dd706457147d23b8f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import {edge_to_plural_models_some_throw as queryEdgeToPluralModelsSomeThrowResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryEdgeToPluralModelsSomeThrowResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryEdgeToPluralModelsSomeThrowResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<?{|
  +id: DataID,
|}>);
export type RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query$variables = {||};
export type RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query$data = {|
  +edge_to_plural_models_some_throw: ?ReadonlyArray<?{|
    +id: string,
  |}>,
|};
export type RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query = {|
  response: RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query$data,
  variables: RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "concreteType": "ErrorModel",
  "kind": "LinkedField",
  "name": "edge_to_plural_models_some_throw",
  "plural": true,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query",
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
            "path": "edge_to_plural_models_some_throw.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "edge_to_plural_models_some_throw",
          "resolverModule": require('../RelayResolverNullableModelClientEdge-test').edge_to_plural_models_some_throw,
          "path": "edge_to_plural_models_some_throw"
        },
        "linkedField": (v0/*: any*/)
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "edge_to_plural_models_some_throw",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": (v0/*: any*/)
      }
    ]
  },
  "params": {
    "cacheID": "e2e77c3bba0a918fdab741702ded9248",
    "id": null,
    "metadata": {},
    "name": "RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4e34ce26b08774bc983ff3702de61c95";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query$variables,
  RelayResolverNullableModelClientEdgeTest_PluralSomeErrorModel_Query$data,
>*/);
