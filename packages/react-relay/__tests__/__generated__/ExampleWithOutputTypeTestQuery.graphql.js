/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<918f907dc1b5afb2cdd180e69f75c012>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {example_client_object as queryExampleClientObjectResolver} from "../../../relay-runtime/store/__tests__/resolvers/ExampleClientObjectResolver.js";
// Type assertion validating that `queryExampleClientObjectResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryExampleClientObjectResolver: () => ?Query__example_client_object$normalization);
import type { Query__example_client_object$normalization } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__example_client_object$normalization.graphql";
export type ExampleWithOutputTypeTestQuery$variables = {||};
export type ExampleWithOutputTypeTestQuery$data = {|
  +example_client_object: ?{|
    +description: ?string,
  |},
|};
export type ExampleWithOutputTypeTestQuery = {|
  response: ExampleWithOutputTypeTestQuery$data,
  variables: ExampleWithOutputTypeTestQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "ExampleWithOutputTypeTestQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "ClientObject",
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "example_client_object",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/ExampleClientObjectResolver').example_client_object,
          "path": "example_client_object",
          "normalizationInfo": {
            "concreteType": "ClientObject",
            "plural": false,
            "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__example_client_object$normalization.graphql')
          }
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "ClientObject",
          "kind": "LinkedField",
          "name": "example_client_object",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "description",
              "storageKey": null
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
    "name": "ExampleWithOutputTypeTestQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "example_client_object",
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "9c67ea6ed47a1a5f70890647fefbc8c9",
    "id": null,
    "metadata": {},
    "name": "ExampleWithOutputTypeTestQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "6af44b9f4263bf177df8d084dc79d494";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ExampleWithOutputTypeTestQuery$variables,
  ExampleWithOutputTypeTestQuery$data,
>*/);
