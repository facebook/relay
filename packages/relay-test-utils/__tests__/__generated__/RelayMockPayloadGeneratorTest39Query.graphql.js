/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b1b6374223afd14c1b86839e8ba65674>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type Environment = "WEB" | "MOBILE" | "%future added value";
export type RelayMockPayloadGeneratorTest39Query$variables = {||};
export type RelayMockPayloadGeneratorTest39QueryVariables = RelayMockPayloadGeneratorTest39Query$variables;
export type RelayMockPayloadGeneratorTest39Query$data = {|
  +node: ?{|
    +id?: string,
    +environment?: ?Environment,
  |},
|};
export type RelayMockPayloadGeneratorTest39QueryResponse = RelayMockPayloadGeneratorTest39Query$data;
export type RelayMockPayloadGeneratorTest39Query = {|
  variables: RelayMockPayloadGeneratorTest39QueryVariables,
  response: RelayMockPayloadGeneratorTest39Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "environment",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest39Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest39Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "2b76a372809dfbaa2c2d9e8faaf7ba34",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "node.environment": {
          "enumValues": [
            "WEB",
            "MOBILE"
          ],
          "nullable": true,
          "plural": false,
          "type": "Environment"
        },
        "node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        }
      }
    },
    "name": "RelayMockPayloadGeneratorTest39Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest39Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      environment\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c272d4431553d23d7c28a579a94bf4c4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest39Query$variables,
  RelayMockPayloadGeneratorTest39Query$data,
>*/);
