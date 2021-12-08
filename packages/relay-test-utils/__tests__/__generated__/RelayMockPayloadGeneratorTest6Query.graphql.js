/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<332bf7f48dbc432933e35f5aff0a12b1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest6Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest6Query$variables = {||};
export type RelayMockPayloadGeneratorTest6QueryVariables = RelayMockPayloadGeneratorTest6Query$variables;
export type RelayMockPayloadGeneratorTest6Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest6Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest6QueryResponse = RelayMockPayloadGeneratorTest6Query$data;
export type RelayMockPayloadGeneratorTest6Query = {|
  variables: RelayMockPayloadGeneratorTest6QueryVariables,
  response: RelayMockPayloadGeneratorTest6Query$data,
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
    "name": "RelayMockPayloadGeneratorTest6Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest6Fragment"
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
    "name": "RelayMockPayloadGeneratorTest6Query",
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
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v1/*: any*/),
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
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
    "cacheID": "72cac1d6dc30017d358a8878bb3e1066",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest6Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest6Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest6Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest6Fragment on User {\n  id\n  name\n  author {\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "216d5f7d912a96c513bc0fff4679f94a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest6Query$variables,
  RelayMockPayloadGeneratorTest6Query$data,
>*/);
