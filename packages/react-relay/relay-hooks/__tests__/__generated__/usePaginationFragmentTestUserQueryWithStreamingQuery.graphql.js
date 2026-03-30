/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<972c92cd00cb6256793cb7d5381917e2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { usePaginationFragmentTestUserFragmentWithStreaming$fragmentType } from "./usePaginationFragmentTestUserFragmentWithStreaming.graphql";
export type usePaginationFragmentTestUserQueryWithStreamingQuery$variables = {|
  after?: ?string,
  before?: ?string,
  first?: ?number,
  id: string,
  isViewerFriend?: ?boolean,
  last?: ?number,
  orderby?: ?ReadonlyArray<?string>,
|};
export type usePaginationFragmentTestUserQueryWithStreamingQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: usePaginationFragmentTestUserFragmentWithStreaming$fragmentType,
  |},
|};
export type usePaginationFragmentTestUserQueryWithStreamingQuery = {|
  response: usePaginationFragmentTestUserQueryWithStreamingQuery$data,
  variables: usePaginationFragmentTestUserQueryWithStreamingQuery$variables,
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
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isViewerFriend"
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
v7 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v8 = {
  "kind": "Variable",
  "name": "orderby",
  "variableName": "orderby"
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v10 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v11 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v12 = [
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
    "variableName": "isViewerFriend"
  },
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "last"
  },
  (v8/*:: as any*/)
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
      (v6/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "usePaginationFragmentTestUserQueryWithStreamingQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*:: as any*/),
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
                "variableName": "isViewerFriend"
              },
              (v8/*:: as any*/)
            ],
            "kind": "FragmentSpread",
            "name": "usePaginationFragmentTestUserFragmentWithStreaming"
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
      (v3/*:: as any*/),
      (v0/*:: as any*/),
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v5/*:: as any*/),
      (v6/*:: as any*/),
      (v4/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "usePaginationFragmentTestUserQueryWithStreamingQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v9/*:: as any*/),
          (v10/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v11/*:: as any*/),
              {
                "alias": null,
                "args": (v12/*:: as any*/),
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "friends",
                "plural": false,
                "selections": [
                  {
                    "if": null,
                    "kind": "Stream",
                    "label": "usePaginationFragmentTestUserFragmentWithStreaming$stream$UserFragment_friends",
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
                              (v10/*:: as any*/),
                              (v11/*:: as any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "username",
                                "storageKey": null
                              },
                              (v9/*:: as any*/)
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
                      }
                    ]
                  },
                  {
                    "if": null,
                    "kind": "Defer",
                    "label": "usePaginationFragmentTestUserFragmentWithStreaming$defer$UserFragment_friends$pageInfo",
                    "selections": [
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
                    ]
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v12/*:: as any*/),
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
    "cacheID": "fcdbb81d22e5cc22e125789bde67f6b2",
    "id": null,
    "metadata": {},
    "name": "usePaginationFragmentTestUserQueryWithStreamingQuery",
    "operationKind": "query",
    "text": "query usePaginationFragmentTestUserQueryWithStreamingQuery(\n  $id: ID!\n  $after: ID\n  $first: Int\n  $before: ID\n  $last: Int\n  $orderby: [String]\n  $isViewerFriend: Boolean\n) {\n  node(id: $id) {\n    __typename\n    ...usePaginationFragmentTestUserFragmentWithStreaming_2nnVOB\n    id\n  }\n}\n\nfragment usePaginationFragmentTestNestedUserFragment on User {\n  username\n}\n\nfragment usePaginationFragmentTestUserFragmentWithStreaming_2nnVOB on User {\n  id\n  name\n  friends(after: $after, first: $first, before: $before, last: $last, orderby: $orderby, isViewerFriend: $isViewerFriend) {\n    edges @stream(label: \"usePaginationFragmentTestUserFragmentWithStreaming$stream$UserFragment_friends\", initial_count: 1) {\n      node {\n        id\n        name\n        ...usePaginationFragmentTestNestedUserFragment\n        __typename\n      }\n      cursor\n    }\n    ... @defer(label: \"usePaginationFragmentTestUserFragmentWithStreaming$defer$UserFragment_friends$pageInfo\") {\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "a8aa8fb48a0000532335af4b5e6f7573";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  usePaginationFragmentTestUserQueryWithStreamingQuery$variables,
  usePaginationFragmentTestUserQueryWithStreamingQuery$data,
>*/);
