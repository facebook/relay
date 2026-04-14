/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0b9cdb1efb9d5c8324a35e6b2567cdb4>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest65Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest65Fragment.graphql";
export type RelayMockPayloadGeneratorTest65Query$variables = {||};
export type RelayMockPayloadGeneratorTest65Query$data = {|
  +me: ?{|
    +friends: ?{|
      +edges: ?ReadonlyArray<?{|
        +node: ?{|
          +$fragmentSpreads: RelayMockPayloadGeneratorTest65Fragment$fragmentType,
        |},
      |}>,
    |},
  |},
|};
export type RelayMockPayloadGeneratorTest65Query = {|
  response: RelayMockPayloadGeneratorTest65Query$data,
  variables: RelayMockPayloadGeneratorTest65Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v2 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "PageInfo",
    "kind": "LinkedField",
    "name": "pageInfo",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "endCursor",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "hasNextPage",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v4 = {
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
    "name": "RelayMockPayloadGeneratorTest65Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": "friends",
            "args": null,
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "__test-65__friends_connection",
            "plural": false,
            "selections": [
              {
                "kind": "Stream",
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
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "RelayMockPayloadGeneratorTest65Fragment"
                          },
                          (v0/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "kind": "Defer",
                "selections": (v2/*:: as any*/)
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest65Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v3/*:: as any*/),
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "friends",
            "plural": false,
            "selections": [
              {
                "if": null,
                "kind": "Stream",
                "label": "RelayMockPayloadGeneratorTest65Query$stream$test-65__friends",
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
                          (v4/*:: as any*/),
                          (v0/*:: as any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*:: as any*/)
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "if": null,
                "kind": "Defer",
                "label": "RelayMockPayloadGeneratorTest65Query$defer$test-65__friends$pageInfo",
                "selections": (v2/*:: as any*/)
              }
            ],
            "storageKey": "friends(first:10)"
          },
          {
            "alias": null,
            "args": (v3/*:: as any*/),
            "filters": null,
            "handle": "connection",
            "key": "test-65__friends",
            "kind": "LinkedHandle",
            "name": "friends"
          },
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "8b0d7d696dc7e2ee0da0a59a77edee4d",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "me",
            "friends"
          ],
          "stream": true
        }
      ]
    },
    "name": "RelayMockPayloadGeneratorTest65Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest65Query {\n  me {\n    friends(first: 10) {\n      edges @stream(label: \"RelayMockPayloadGeneratorTest65Query$stream$test-65__friends\", if: true, initial_count: 4) {\n        node {\n          ...RelayMockPayloadGeneratorTest65Fragment\n          id\n          __typename\n        }\n        cursor\n      }\n      ... @defer(label: \"RelayMockPayloadGeneratorTest65Query$defer$test-65__friends$pageInfo\", if: true) {\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest65Fragment on User {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "3fb480ea57361c868a4a0f0cfbc91aab";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayMockPayloadGeneratorTest65Query$variables,
  RelayMockPayloadGeneratorTest65Query$data,
>*/);
