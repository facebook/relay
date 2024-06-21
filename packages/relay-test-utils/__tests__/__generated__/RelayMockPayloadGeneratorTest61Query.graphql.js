/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<91892cb69e03d6b0d3a81581c91a2ec2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest61Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest61Fragment.graphql";
export type RelayMockPayloadGeneratorTest61Query$variables = {||};
export type RelayMockPayloadGeneratorTest61Query$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest61Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest61Query = {|
  response: RelayMockPayloadGeneratorTest61Query$data,
  variables: RelayMockPayloadGeneratorTest61Query$variables,
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
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest61Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v1/*: any*/),
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayMockPayloadGeneratorTest61Fragment"
              }
            ]
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
    "name": "RelayMockPayloadGeneratorTest61Query",
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
            "if": null,
            "kind": "Defer",
            "label": "RelayMockPayloadGeneratorTest61Query$defer$RelayMockPayloadGeneratorTest61Fragment",
            "selections": [
              {
                "kind": "InlineFragment",
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "name",
                    "storageKey": null
                  }
                ],
                "type": "User",
                "abstractKey": null
              }
            ]
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "ed4399c32897d40564a0ec88514016e0",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest61Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest61Query {\n  node(id: \"my-id\") {\n    __typename\n    id\n    ...RelayMockPayloadGeneratorTest61Fragment @defer(label: \"RelayMockPayloadGeneratorTest61Query$defer$RelayMockPayloadGeneratorTest61Fragment\")\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest61Fragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2f6426e08b7bf1bc520a2e62d89805ff";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest61Query$variables,
  RelayMockPayloadGeneratorTest61Query$data,
>*/);
