/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b60f9be37e49bd9482ef13fc1e74fd44>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest63Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest63Fragment.graphql";
export type RelayMockPayloadGeneratorTest63Query$variables = {||};
export type RelayMockPayloadGeneratorTest63Query$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest63Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest63Query = {|
  response: RelayMockPayloadGeneratorTest63Query$data,
  variables: RelayMockPayloadGeneratorTest63Query$variables,
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
    "name": "RelayMockPayloadGeneratorTest63Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest63Fragment"
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
    "name": "RelayMockPayloadGeneratorTest63Query",
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
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "6e1f88b885f100be4bd640bd33bf071c",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest63Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest63Query {\n  node(id: \"my-id\") {\n    __typename\n    id\n    ...RelayMockPayloadGeneratorTest63Fragment\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest63Fragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "eb1568209e8f70eb6e179622fddb10e3";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest63Query$variables,
  RelayMockPayloadGeneratorTest63Query$data,
>*/);
