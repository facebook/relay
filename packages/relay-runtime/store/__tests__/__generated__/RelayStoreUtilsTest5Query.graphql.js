/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<500774114848a5ce08730796e8edf8dd>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayStoreUtilsTest5Query$variables = {|
  count: number,
  cursor?: ?string,
  dynamicKey: string,
|};
export type RelayStoreUtilsTest5Query$data = {|
  +me: ?{|
    +friends: ?{|
      +edges: ?ReadonlyArray<?{|
        +node: ?{|
          +id: string,
        |},
      |}>,
    |},
  |},
|};
export type RelayStoreUtilsTest5Query = {|
  response: RelayStoreUtilsTest5Query$data,
  variables: RelayStoreUtilsTest5Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cursor"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "dynamicKey"
  }
],
v1 = {
  "kind": "Variable",
  "name": "__dynamicKey",
  "variableName": "dynamicKey"
},
v2 = {
  "kind": "Literal",
  "name": "orderby",
  "value": [
    "name"
  ]
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
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
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "cursor",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
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
v5 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "cursor"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  },
  (v2/*:: as any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayStoreUtilsTest5Query",
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
            "args": [
              (v1/*:: as any*/),
              (v2/*:: as any*/)
            ],
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "__UserQuery_friends_connection",
            "plural": false,
            "selections": (v4/*:: as any*/),
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayStoreUtilsTest5Query",
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
            "args": (v5/*:: as any*/),
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "friends",
            "plural": false,
            "selections": (v4/*:: as any*/),
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v5/*:: as any*/),
            "filters": [
              "orderby"
            ],
            "handle": "connection",
            "key": "UserQuery_friends",
            "kind": "LinkedHandle",
            "name": "friends",
            "dynamicKey": (v1/*:: as any*/)
          },
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c31f812dfcbadfc88e2fc160183171cc",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": "count",
          "cursor": "cursor",
          "direction": "forward",
          "path": [
            "me",
            "friends"
          ]
        }
      ]
    },
    "name": "RelayStoreUtilsTest5Query",
    "operationKind": "query",
    "text": "query RelayStoreUtilsTest5Query(\n  $count: Int!\n  $cursor: ID\n) {\n  me {\n    friends(after: $cursor, first: $count, orderby: [\"name\"]) {\n      edges {\n        node {\n          id\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "e644d9c61083f0eb6074881df797b11f";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayStoreUtilsTest5Query$variables,
  RelayStoreUtilsTest5Query$data,
>*/);
