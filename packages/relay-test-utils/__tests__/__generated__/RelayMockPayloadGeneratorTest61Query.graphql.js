/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8bd31d1467a7b1b340295fa768c2a6ce>>
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
                  (v2/*: any*/),
                  (v1/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "FriendsConnection",
                    "kind": "LinkedField",
                    "name": "friends",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "FriendsEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "User",
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              {
                                "if": null,
                                "kind": "Defer",
                                "label": "RelayMockPayloadGeneratorTest61Fragment$defer$RelayMockPayloadGeneratorTest61SubFragment",
                                "selections": [
                                  (v1/*: any*/),
                                  (v2/*: any*/)
                                ]
                              },
                              (v1/*: any*/)
                            ],
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      }
                    ],
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
    "cacheID": "aafc055b85b18a9924f0cb18b78d581d",
    "id": null,
    "metadata": {},
    "name": "RelayMockPayloadGeneratorTest61Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest61Query {\n  node(id: \"my-id\") {\n    __typename\n    id\n    ...RelayMockPayloadGeneratorTest61Fragment @defer(label: \"RelayMockPayloadGeneratorTest61Query$defer$RelayMockPayloadGeneratorTest61Fragment\")\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest61Fragment on User {\n  name\n  id\n  friends {\n    edges {\n      node {\n        ...RelayMockPayloadGeneratorTest61SubFragment @defer(label: \"RelayMockPayloadGeneratorTest61Fragment$defer$RelayMockPayloadGeneratorTest61SubFragment\")\n        id\n      }\n    }\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest61SubFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c227dfa395367e6e586d0105e47e1a7d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest61Query$variables,
  RelayMockPayloadGeneratorTest61Query$data,
>*/);
