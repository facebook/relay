/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0a08dcf87b950c2a2f364070c81472a1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayMockEnvironmentWithComponentsTestOutstandingSolutionQueryVariables = {||};
export type RelayMockEnvironmentWithComponentsTestOutstandingSolutionQueryResponse = {|
  +viewer: ?{|
    +actor: ?{|
      +name: ?string,
    |},
  |},
|};
export type RelayMockEnvironmentWithComponentsTestOutstandingSolutionQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestOutstandingSolutionQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestOutstandingSolutionQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockEnvironmentWithComponentsTestOutstandingSolutionQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "alias": "name",
                "args": null,
                "kind": "ScalarField",
                "name": "__name_hello",
                "storageKey": null
              }
            ],
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
    "name": "RelayMockEnvironmentWithComponentsTestOutstandingSolutionQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
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
                "handle": "hello",
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "64a289c67609f9a141affa4c3a117ad0",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "viewer": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Viewer"
        },
        "viewer.actor": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Actor"
        },
        "viewer.actor.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "viewer.actor.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "viewer.actor.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "RelayMockEnvironmentWithComponentsTestOutstandingSolutionQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestOutstandingSolutionQuery {\n  viewer {\n    actor {\n      __typename\n      name\n      id\n    }\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "e8326016e942abe55f8a45e953970d18";
}

module.exports = node;
