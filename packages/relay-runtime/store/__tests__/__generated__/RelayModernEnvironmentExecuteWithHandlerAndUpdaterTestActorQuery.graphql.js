/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<42d5640af36d635df203b6faf5578114>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery$variables = {||};
export type RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQueryVariables = RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery$variables;
export type RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery$data = {|
  +me: ?{|
    +name: ?string,
  |},
|};
export type RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQueryResponse = RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery$data;
export type RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery = {|
  variables: RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQueryVariables,
  response: RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": "name",
            "args": null,
            "kind": "ScalarField",
            "name": "__name_name_handler",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "name_handler",
            "key": "",
            "kind": "ScalarHandle",
            "name": "name"
          },
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
    ]
  },
  "params": {
    "cacheID": "0e4441d070b49868ba2eea8266196739",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery {\n  me {\n    name\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "6d9f8375f8d7b1f2c54baa8d057d7c07";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery$variables,
  RelayModernEnvironmentExecuteWithHandlerAndUpdaterTestActorQuery$data,
>*/);
