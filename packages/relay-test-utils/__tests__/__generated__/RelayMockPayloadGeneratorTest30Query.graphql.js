/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8d52e5dc518f00718e68bcc81b77e3ef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest30Query$variables = {||};
export type RelayMockPayloadGeneratorTest30QueryVariables = RelayMockPayloadGeneratorTest30Query$variables;
export type RelayMockPayloadGeneratorTest30Query$data = {|
  +node: ?{|
    +id?: string,
    +emailAddresses?: ?$ReadOnlyArray<?string>,
  |},
|};
export type RelayMockPayloadGeneratorTest30QueryResponse = RelayMockPayloadGeneratorTest30Query$data;
export type RelayMockPayloadGeneratorTest30Query = {|
  variables: RelayMockPayloadGeneratorTest30QueryVariables,
  response: RelayMockPayloadGeneratorTest30Query$data,
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
    "name": "RelayMockPayloadGeneratorTest30Query",
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
    "name": "RelayMockPayloadGeneratorTest30Query",
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
    "cacheID": "5b1e7adf04924fe25f02e7f286968fe3",
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
    "name": "RelayMockPayloadGeneratorTest30Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest30Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      emailAddresses\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "782ee541df20042252eafb0746036d68";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest30Query$variables,
  RelayMockPayloadGeneratorTest30Query$data,
>*/);
