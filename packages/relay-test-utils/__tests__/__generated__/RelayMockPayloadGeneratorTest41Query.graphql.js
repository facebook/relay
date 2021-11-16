/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d3e768fd872d6ea1cf4ca0de06093f41>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type Environment = "WEB" | "MOBILE" | "%future added value";
export type RelayMockPayloadGeneratorTest41Query$variables = {||};
export type RelayMockPayloadGeneratorTest41QueryVariables = RelayMockPayloadGeneratorTest41Query$variables;
export type RelayMockPayloadGeneratorTest41Query$data = {|
  +node: ?{|
    +id?: string,
    +environment?: ?Environment,
  |},
|};
export type RelayMockPayloadGeneratorTest41QueryResponse = RelayMockPayloadGeneratorTest41Query$data;
export type RelayMockPayloadGeneratorTest41Query = {|
  variables: RelayMockPayloadGeneratorTest41QueryVariables,
  response: RelayMockPayloadGeneratorTest41Query$data,
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
    "name": "RelayMockPayloadGeneratorTest41Query",
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
    "name": "RelayMockPayloadGeneratorTest41Query",
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
    "cacheID": "6e28a21892689cb384d452f4e7b89206",
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
    "name": "RelayMockPayloadGeneratorTest41Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest41Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      environment\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3de0e92d6fb1c761c37e7b2dec537f21";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest41Query$variables,
  RelayMockPayloadGeneratorTest41Query$data,
>*/);
