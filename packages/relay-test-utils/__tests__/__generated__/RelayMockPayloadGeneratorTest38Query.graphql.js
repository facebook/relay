/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5b9ed80f3541445fc4646ac2b8695c2e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest38Query$variables = {||};
export type RelayMockPayloadGeneratorTest38QueryVariables = RelayMockPayloadGeneratorTest38Query$variables;
export type RelayMockPayloadGeneratorTest38Query$data = {|
  +node: ?{|
    +id?: string,
    +emailAddresses?: ?$ReadOnlyArray<?string>,
  |},
|};
export type RelayMockPayloadGeneratorTest38QueryResponse = RelayMockPayloadGeneratorTest38Query$data;
export type RelayMockPayloadGeneratorTest38Query = {|
  variables: RelayMockPayloadGeneratorTest38QueryVariables,
  response: RelayMockPayloadGeneratorTest38Query$data,
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
  "name": "emailAddresses",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest38Query",
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
    "name": "RelayMockPayloadGeneratorTest38Query",
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
    "cacheID": "23d3bafc4070ae2cb88122a0dcacb0ef",
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
        "node.emailAddresses": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "String"
        },
        "node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        }
      }
    },
    "name": "RelayMockPayloadGeneratorTest38Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest38Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      emailAddresses\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a03453e14879e157cebddf5b1a18a276";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest38Query$variables,
  RelayMockPayloadGeneratorTest38Query$data,
>*/);
