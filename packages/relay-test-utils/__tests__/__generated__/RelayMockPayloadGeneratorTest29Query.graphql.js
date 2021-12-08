/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8a8df59c4fa88af033a8c4e454ccde1f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest29Query$variables = {||};
export type RelayMockPayloadGeneratorTest29QueryVariables = RelayMockPayloadGeneratorTest29Query$variables;
export type RelayMockPayloadGeneratorTest29Query$data = {|
  +node: ?{|
    +id?: string,
    +emailAddresses?: ?$ReadOnlyArray<?string>,
  |},
|};
export type RelayMockPayloadGeneratorTest29QueryResponse = RelayMockPayloadGeneratorTest29Query$data;
export type RelayMockPayloadGeneratorTest29Query = {|
  variables: RelayMockPayloadGeneratorTest29QueryVariables,
  response: RelayMockPayloadGeneratorTest29Query$data,
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
    "name": "RelayMockPayloadGeneratorTest29Query",
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
    "name": "RelayMockPayloadGeneratorTest29Query",
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
    "cacheID": "318e451860d19f1291c025bec9d69bf3",
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
    "name": "RelayMockPayloadGeneratorTest29Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest29Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      emailAddresses\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "4c94de207a7f86585760fa740739802b";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest29Query$variables,
  RelayMockPayloadGeneratorTest29Query$data,
>*/);
