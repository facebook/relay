/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<86e78e986e692e1e021ded761a9a0389>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { WeakModel____relay_model_instance$data } from "./WeakModel____relay_model_instance.graphql";
import {edge_to_null_weak_model as queryEdgeToNullWeakModelResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryEdgeToNullWeakModelResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryEdgeToNullWeakModelResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?WeakModel);
import {first_name as weakModelFirstNameResolverType} from "../RelayResolverNullableModelClientEdge-test.js";
// Type assertion validating that `weakModelFirstNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(weakModelFirstNameResolverType: (
  __relay_model_instance: WeakModel____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
import type { WeakModel } from "../RelayResolverNullableModelClientEdge-test.js";
export type RelayResolverNullableModelClientEdgeTest_WeakModel_Query$variables = {||};
export type RelayResolverNullableModelClientEdgeTest_WeakModel_Query$data = {|
  +edge_to_null_weak_model: ?{|
    +first_name: ?string,
  |},
|};
export type RelayResolverNullableModelClientEdgeTest_WeakModel_Query = {|
  response: RelayResolverNullableModelClientEdgeTest_WeakModel_Query$data,
  variables: RelayResolverNullableModelClientEdgeTest_WeakModel_Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverNullableModelClientEdgeTest_WeakModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "WeakModel",
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "edge_to_null_weak_model",
          "resolverModule": require('../RelayResolverNullableModelClientEdge-test').edge_to_null_weak_model,
          "path": "edge_to_null_weak_model",
          "normalizationInfo": {
            "kind": "WeakModel",
            "concreteType": "WeakModel",
            "plural": false
          }
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "WeakModel",
          "kind": "LinkedField",
          "name": "edge_to_null_weak_model",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "fragment": {
                "args": null,
                "kind": "FragmentSpread",
                "name": "WeakModel____relay_model_instance"
              },
              "kind": "RelayResolver",
              "name": "first_name",
              "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./WeakModel____relay_model_instance.graphql'), require('../RelayResolverNullableModelClientEdge-test').first_name, '__relay_model_instance', true),
              "path": "edge_to_null_weak_model.first_name"
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
    "name": "RelayResolverNullableModelClientEdgeTest_WeakModel_Query",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "edge_to_null_weak_model",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "WeakModel",
          "kind": "LinkedField",
          "name": "edge_to_null_weak_model",
          "plural": false,
          "selections": [
            {
              "name": "first_name",
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
                "type": "WeakModel",
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
    "cacheID": "a25d6728f75a10c69d1e13cb6be2e84a",
    "id": null,
    "metadata": {},
    "name": "RelayResolverNullableModelClientEdgeTest_WeakModel_Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "e3560014bc230453c5e68fddb617537e";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverNullableModelClientEdgeTest_WeakModel_Query$variables,
  RelayResolverNullableModelClientEdgeTest_WeakModel_Query$data,
>*/);
