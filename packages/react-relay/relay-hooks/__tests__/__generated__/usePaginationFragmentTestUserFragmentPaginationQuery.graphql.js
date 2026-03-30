/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<81f337905ead2c4356c10a6310e86c2a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import type { usePaginationFragmentTestUserFragment$fragmentType } from "./usePaginationFragmentTestUserFragment.graphql";
export type usePaginationFragmentTestUserFragmentPaginationQuery$variables = {|
  after?: ?string,
  before?: ?string,
  first?: ?number,
  id: string,
  isViewerFriendLocal?: ?boolean,
  last?: ?number,
  orderby?: ?ReadonlyArray<?string>,
  scale?: ?number,
|};
export type usePaginationFragmentTestUserFragmentPaginationQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: usePaginationFragmentTestUserFragment$fragmentType,
  |},
|};
export type usePaginationFragmentTestUserFragmentPaginationQuery = {|
  response: usePaginationFragmentTestUserFragmentPaginationQuery$data,
  variables: usePaginationFragmentTestUserFragmentPaginationQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "before"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "first"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v4 = {
  "defaultValue": false,
  "kind": "LocalArgument",
  "name": "isViewerFriendLocal"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "last"
},
v6 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderby"
},
v7 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "scale"
},
v8 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v9 = {
  "kind": "Variable",
  "name": "orderby",
  "variableName": "orderby"
},
v10 = {
  "kind": "Variable",
  "name": "scale",
  "variableName": "scale"
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v12 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v13 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v14 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "before",
    "variableName": "before"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "first"
  },
  {
    "kind": "Variable",
    "name": "isViewerFriend",
    "variableName": "isViewerFriendLocal"
  },
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "last"
  },
  (v9/*:: as any*/),
  (v10/*:: as any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/),
      (v6/*:: as any*/),
      (v7/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "usePaginationFragmentTestUserFragmentPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v8/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Variable",
                "name": "isViewerFriendLocal",
                "variableName": "isViewerFriendLocal"
              },
              (v9/*:: as any*/),
              (v10/*:: as any*/)
            ],
            "kind": "FragmentSpread",
            "name": "usePaginationFragmentTestUserFragment"
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
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/),
      (v6/*:: as any*/),
      (v7/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "usePaginationFragmentTestUserFragmentPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v8/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v11/*:: as any*/),
          (v12/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v13/*:: as any*/),
              {
                "alias": null,
                "args": (v14/*:: as any*/),
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
                          (v12/*:: as any*/),
                          (v13/*:: as any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "username",
                            "storageKey": null
                          },
                          (v11/*:: as any*/)
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
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "hasPreviousPage",
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "startCursor",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v14/*:: as any*/),
                "filters": [
                  "orderby",
                  "isViewerFriend"
                ],
                "handle": "connection",
                "key": "UserFragment_friends",
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
    "cacheID": "0f1549da342f48b8a0be8184900c91b8",
    "id": null,
    "metadata": {},
    "name": "usePaginationFragmentTestUserFragmentPaginationQuery",
    "operationKind": "query",
    "text": "query usePaginationFragmentTestUserFragmentPaginationQuery(\n  $after: ID\n  $before: ID\n  $first: Int\n  $isViewerFriendLocal: Boolean = false\n  $last: Int\n  $orderby: [String]\n  $scale: Float\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...usePaginationFragmentTestUserFragment_1Z7T3A\n    id\n  }\n}\n\nfragment usePaginationFragmentTestNestedUserFragment on User {\n  username\n}\n\nfragment usePaginationFragmentTestUserFragment_1Z7T3A on User {\n  id\n  name\n  friends(after: $after, first: $first, before: $before, last: $last, orderby: $orderby, isViewerFriend: $isViewerFriendLocal, scale: $scale) {\n    edges {\n      node {\n        id\n        name\n        ...usePaginationFragmentTestNestedUserFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "fe5dabc8eef251e3032e850d1c26f222";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  usePaginationFragmentTestUserFragmentPaginationQuery$variables,
  usePaginationFragmentTestUserFragmentPaginationQuery$data,
>*/);
