/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fbc9c1cd27bf3697c54b02a7da99d7d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest28Query$variables = {||};
export type RelayMockPayloadGeneratorTest28QueryVariables = RelayMockPayloadGeneratorTest28Query$variables;
export type RelayMockPayloadGeneratorTest28Query$data = {|
  +node: ?{|
    +id?: string,
    +name?: ?string,
  |},
|};
export type RelayMockPayloadGeneratorTest28QueryResponse = RelayMockPayloadGeneratorTest28Query$data;
export type RelayMockPayloadGeneratorTest28Query = {|
  variables: RelayMockPayloadGeneratorTest28QueryVariables,
  response: RelayMockPayloadGeneratorTest28Query$data,
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
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest28Query",
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
    "name": "RelayMockPayloadGeneratorTest28Query",
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
    "cacheID": "bb42c409a282fe3a9ee1d2c03222cf01",
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
    "name": "RelayMockPayloadGeneratorTest28Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest28Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "49ee39f1ae9db77e24a45f7cefcd1b5a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest28Query$variables,
  RelayMockPayloadGeneratorTest28Query$data,
>*/);
