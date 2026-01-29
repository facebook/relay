/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<14d6d8cfc809694e6ed8e47cc2da2588>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {example_client_object as queryExampleClientObjectResolverType} from "../../../relay-runtime/store/__tests__/resolvers/ExampleClientObjectResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryExampleClientObjectResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryExampleClientObjectResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?Query__example_client_object$normalization);
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

var node/*: ClientRequest*/ = (function(){
var v0 = {
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
};
return {
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
        "modelResolvers": null,
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "example_client_object",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/ExampleClientObjectResolver').example_client_object,
          "path": "example_client_object",
          "normalizationInfo": {
            "kind": "OutputType",
            "concreteType": "ClientObject",
            "plural": false,
            "normalizationNode": require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/Query__example_client_object$normalization.graphql')
          }
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
    "name": "ExampleWithOutputTypeTestQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "example_client_object",
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": true
        },
        "linkedField": (v0/*: any*/)
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
})();

if (__DEV__) {
  (node/*: any*/).hash = "6af44b9f4263bf177df8d084dc79d494";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  ExampleWithOutputTypeTestQuery$variables,
  ExampleWithOutputTypeTestQuery$data,
>*/);
