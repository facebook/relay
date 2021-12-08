/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cd4e249160b39e35c43c3cdeeb3611d1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTest3Query$variables = {|
  id: string,
  orderBy?: ?$ReadOnlyArray<?string>,
  isViewerFriend?: ?boolean,
|};
export type RelayResponseNormalizerTest3QueryVariables = RelayResponseNormalizerTest3Query$variables;
export type RelayResponseNormalizerTest3Query$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +friends?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +cursor: ?string,
        +node: ?{|
          +id: string,
        |},
      |}>,
      +pageInfo: ?{|
        +hasNextPage: ?boolean,
        +endCursor: ?string,
      |},
    |},
  |},
|};
export type RelayResponseNormalizerTest3QueryResponse = RelayResponseNormalizerTest3Query$data;
export type RelayResponseNormalizerTest3Query = {|
  variables: RelayResponseNormalizerTest3QueryVariables,
  response: RelayResponseNormalizerTest3Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isViewerFriend"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderBy"
},
v3 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v6 = {
  "kind": "Variable",
  "name": "isViewerFriend",
  "variableName": "isViewerFriend"
},
v7 = {
  "kind": "Variable",
  "name": "orderby",
  "variableName": "orderBy"
},
v8 = [
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
        "kind": "ScalarField",
        "name": "cursor",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/)
        ],
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
        "name": "hasNextPage",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "endCursor",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v9 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  },
  (v6/*: any*/),
  (v7/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayResponseNormalizerTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "friends",
                "args": [
                  (v6/*: any*/),
                  (v7/*: any*/)
                ],
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "__UserFriends_friends_bestFriends",
                "plural": false,
                "selections": (v8/*: any*/),
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayResponseNormalizerTest3Query",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
          (v5/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v9/*: any*/),
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "friends",
                "plural": false,
                "selections": (v8/*: any*/),
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v9/*: any*/),
                "filters": [
                  "orderby",
                  "isViewerFriend"
                ],
                "handle": "bestFriends",
                "key": "UserFriends_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3f994b1e5a5f7f43db2fa451b36642ab",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTest3Query",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTest3Query(\n  $id: ID!\n  $orderBy: [String]\n  $isViewerFriend: Boolean\n) {\n  node(id: $id) {\n    id\n    __typename\n    ... on User {\n      friends(first: 1, orderby: $orderBy, isViewerFriend: $isViewerFriend) {\n        edges {\n          cursor\n          node {\n            id\n          }\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "551218ce1d354f656b656ac1af62fe4d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTest3Query$variables,
  RelayResponseNormalizerTest3Query$data,
>*/);
