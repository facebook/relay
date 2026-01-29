/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<218261eef4f20675a92eb21278f0bbd5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayMockPayloadGeneratorTest64Fragment$fragmentType } from "./RelayMockPayloadGeneratorTest64Fragment.graphql";
export type RelayMockPayloadGeneratorTest64Query$variables = {||};
export type RelayMockPayloadGeneratorTest64Query$data = {|
  +me: ?{|
    +friends: ?{|
      +edges: ?ReadonlyArray<?{|
        +node: ?{|
          +$fragmentSpreads: RelayMockPayloadGeneratorTest64Fragment$fragmentType,
        |},
      |}>,
    |},
  |},
|};
export type RelayMockPayloadGeneratorTest64Query = {|
  response: RelayMockPayloadGeneratorTest64Query$data,
  variables: RelayMockPayloadGeneratorTest64Query$variables,
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
    "name": "RelayMockPayloadGeneratorTest64Query",
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
            "name": "__test-64__friends_connection",
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
                            "name": "RelayMockPayloadGeneratorTest64Fragment"
                          },
                          (v0/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "kind": "Defer",
                "selections": (v2/*: any*/)
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
    "name": "RelayMockPayloadGeneratorTest64Query",
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
            "args": (v3/*: any*/),
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "friends",
            "plural": false,
            "selections": [
              {
                "if": null,
                "kind": "Stream",
                "label": "RelayMockPayloadGeneratorTest64Query$stream$test-64__friends",
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
                          (v4/*: any*/),
                          (v0/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  }
                ]
              },
              {
                "if": null,
                "kind": "Defer",
                "label": "RelayMockPayloadGeneratorTest64Query$defer$test-64__friends$pageInfo",
                "selections": (v2/*: any*/)
              }
            ],
            "storageKey": "friends(first:10)"
          },
          {
            "alias": null,
            "args": (v3/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "test-64__friends",
            "kind": "LinkedHandle",
            "name": "friends"
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "eabbf98536e253e43e87fba3960e5d6b",
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
    "name": "RelayMockPayloadGeneratorTest64Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest64Query {\n  me {\n    friends(first: 10) {\n      edges @stream(label: \"RelayMockPayloadGeneratorTest64Query$stream$test-64__friends\", initial_count: 4) {\n        node {\n          ...RelayMockPayloadGeneratorTest64Fragment\n          id\n          __typename\n        }\n        cursor\n      }\n      ... @defer(label: \"RelayMockPayloadGeneratorTest64Query$defer$test-64__friends$pageInfo\") {\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n    }\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest64Fragment on User {\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d6bbd2f2c4ce30f659a885858e9729f4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest64Query$variables,
  RelayMockPayloadGeneratorTest64Query$data,
>*/);
