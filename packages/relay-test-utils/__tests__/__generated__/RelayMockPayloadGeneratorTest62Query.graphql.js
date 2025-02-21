/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3a82a415193676b0bbe6bf89b2294108>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest62Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest62Fragment.graphql";
export type RelayMockPayloadGeneratorTest62Query$variables = {||};
export type RelayMockPayloadGeneratorTest62Query$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: RelayMockPayloadGeneratorTest62Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest62Query = {|
  response: RelayMockPayloadGeneratorTest62Query$data,
  variables: RelayMockPayloadGeneratorTest62Query$variables,
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
    "name": "RelayMockPayloadGeneratorTest62Query",
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
                "name": "RelayMockPayloadGeneratorTest62Fragment"
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
    "name": "RelayMockPayloadGeneratorTest62Query",
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
            "label": "RelayMockPayloadGeneratorTest62Query$defer$RelayMockPayloadGeneratorTest62Fragment",
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
    "cacheID": "555b245d7d41b5e70f0378297709a7ce",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest62Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest62Query {\n  node(id: \"my-id\") {\n    __typename\n    id\n    ...RelayMockPayloadGeneratorTest62Fragment @defer(label: \"RelayMockPayloadGeneratorTest62Query$defer$RelayMockPayloadGeneratorTest62Fragment\", if: true)\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest62Fragment on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a022e454cd8aa6d39c0ed51d0621a5a3";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest62Query$variables,
  RelayMockPayloadGeneratorTest62Query$data,
>*/);
