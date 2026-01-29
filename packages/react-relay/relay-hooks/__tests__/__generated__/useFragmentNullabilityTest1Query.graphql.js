/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<124d562a9ef8b2a66a2f45a6cea04174>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import {field_that_throws as queryFieldThatThrowsResolverType} from "../useFragment_nullability-test.js";
import type { TestResolverContextType } from "../../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryFieldThatThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryFieldThatThrowsResolverType: (
  args: void,
  context: TestResolverContextType,
) => number);
export type useFragmentNullabilityTest1Query$variables = {||};
export type useFragmentNullabilityTest1Query$data = {|
  +field_that_throws: number,
|};
export type useFragmentNullabilityTest1Query = {|
  response: useFragmentNullabilityTest1Query$data,
  variables: useFragmentNullabilityTest1Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "throwOnFieldError": true
    },
    "name": "useFragmentNullabilityTest1Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "name": "field_that_throws",
            "resolverModule": require('../useFragment_nullability-test').field_that_throws,
            "path": "field_that_throws"
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "useFragmentNullabilityTest1Query",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "name": "field_that_throws",
            "args": null,
            "fragment": null,
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "5dc12cf6a0aa364b0a4db301e63f1190",
    "id": null,
    "metadata": {},
    "name": "useFragmentNullabilityTest1Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "61fff2873123177b72b204296bd4c86f";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  useFragmentNullabilityTest1Query$variables,
  useFragmentNullabilityTest1Query$data,
>*/);
