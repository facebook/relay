/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b592f41b8d99e5094ac1ab6f815218ea>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type Environment = "WEB" | "MOBILE" | "%future added value";
export type RelayMockPayloadGeneratorTest22Query$variables = {||};
export type RelayMockPayloadGeneratorTest22QueryVariables = RelayMockPayloadGeneratorTest22Query$variables;
export type RelayMockPayloadGeneratorTest22Query$data = {|
  +node: ?{|
    +id?: string,
    +name?: ?string,
    +environment?: ?Environment,
  |},
|};
export type RelayMockPayloadGeneratorTest22QueryResponse = RelayMockPayloadGeneratorTest22Query$data;
export type RelayMockPayloadGeneratorTest22Query = {|
  variables: RelayMockPayloadGeneratorTest22QueryVariables,
  response: RelayMockPayloadGeneratorTest22Query$data,
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
  "name": "name",
  "storageKey": null
},
v3 = {
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
    "name": "RelayMockPayloadGeneratorTest22Query",
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
              (v2/*: any*/),
              (v3/*: any*/)
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
    "name": "RelayMockPayloadGeneratorTest22Query",
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
              (v2/*: any*/),
              (v3/*: any*/)
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
    "cacheID": "e51cbe1cfc3a7e27f71b62396f25ac60",
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
        },
        "node.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "RelayMockPayloadGeneratorTest22Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest22Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      name\n      environment\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "233afb53c100115729293bb2ce122c47";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest22Query$variables,
  RelayMockPayloadGeneratorTest22Query$data,
>*/);
