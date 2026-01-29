/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<84ae0ebffbd1a8c7a817b2707558c783>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type PersonalityTraits = "CHEERFUL" | "DERISIVE" | "HELPFUL" | "SNARKY" | "%future added value";
export type RelayMockPayloadGeneratorTest40Query$variables = {||};
export type RelayMockPayloadGeneratorTest40Query$data = {|
  +node: ?{|
    +id?: string,
    +traits?: ?ReadonlyArray<?PersonalityTraits>,
  |},
|};
export type RelayMockPayloadGeneratorTest40Query = {|
  response: RelayMockPayloadGeneratorTest40Query$data,
  variables: RelayMockPayloadGeneratorTest40Query$variables,
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
  "name": "traits",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest40Query",
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
    "name": "RelayMockPayloadGeneratorTest40Query",
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
    "cacheID": "19331237402aafaf4aaac33295fe7338",
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
        "node.traits": {
          "enumValues": [
            "CHEERFUL",
            "DERISIVE",
            "HELPFUL",
            "SNARKY"
          ],
          "nullable": true,
          "plural": true,
          "type": "PersonalityTraits"
        }
      }
    },
    "name": "RelayMockPayloadGeneratorTest40Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest40Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      traits\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3701a984f2c55db48e915d7e39baebfa";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest40Query$variables,
  RelayMockPayloadGeneratorTest40Query$data,
>*/);
