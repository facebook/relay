/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b1a335674488dea8ac5566e8d546225f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type useBlockingPaginationFragmentTest2Fragment$fragmentType = any;
export type useBlockingPaginationFragmentTest2FragmentPaginationQuery$variables = {|
  after?: ?string,
  before?: ?string,
  first?: ?number,
  isViewerFriendLocal?: ?boolean,
  last?: ?number,
  orderby?: ?$ReadOnlyArray<?string>,
  id: string,
|};
export type useBlockingPaginationFragmentTest2FragmentPaginationQueryVariables = useBlockingPaginationFragmentTest2FragmentPaginationQuery$variables;
export type useBlockingPaginationFragmentTest2FragmentPaginationQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useBlockingPaginationFragmentTest2Fragment$fragmentType,
  |},
|};
export type useBlockingPaginationFragmentTest2FragmentPaginationQueryResponse = useBlockingPaginationFragmentTest2FragmentPaginationQuery$data;
export type useBlockingPaginationFragmentTest2FragmentPaginationQuery = {|
  variables: useBlockingPaginationFragmentTest2FragmentPaginationQueryVariables,
  response: useBlockingPaginationFragmentTest2FragmentPaginationQuery$data,
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
v7 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v10 = [
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
  {
    "kind": "Variable",
    "name": "orderby",
    "variableName": "orderby"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useBlockingPaginationFragmentTest2FragmentPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "useBlockingPaginationFragmentTest2Fragment"
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
      (v1/*: any*/),
      (v2/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "useBlockingPaginationFragmentTest2FragmentPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v8/*: any*/),
          (v9/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v10/*: any*/),
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "friends",
                "plural": false,
                "selections": [
                  {
                    "if": null,
                    "kind": "Stream",
                    "label": "useBlockingPaginationFragmentTest2Fragment$stream$UserFragment_friends",
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
                              (v9/*: any*/),
                              (v8/*: any*/)
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
                    "label": "useBlockingPaginationFragmentTest2Fragment$defer$UserFragment_friends$pageInfo",
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
                "args": (v10/*: any*/),
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
    "cacheID": "21f5959c1f08c645b9fac7436c637497",
    "id": null,
    "metadata": {},
    "name": "useBlockingPaginationFragmentTest2FragmentPaginationQuery",
    "operationKind": "query",
    "text": "query useBlockingPaginationFragmentTest2FragmentPaginationQuery(\n  $after: ID\n  $before: ID\n  $first: Int\n  $isViewerFriendLocal: Boolean\n  $last: Int\n  $orderby: [String]\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useBlockingPaginationFragmentTest2Fragment\n    id\n  }\n}\n\nfragment useBlockingPaginationFragmentTest2Fragment on User {\n  id\n  friends(after: $after, first: $first, before: $before, last: $last, orderby: $orderby, isViewerFriend: $isViewerFriendLocal) {\n    edges @stream(label: \"useBlockingPaginationFragmentTest2Fragment$stream$UserFragment_friends\", initial_count: 1) {\n      node {\n        id\n        __typename\n      }\n      cursor\n    }\n    ... @defer(label: \"useBlockingPaginationFragmentTest2Fragment$defer$UserFragment_friends$pageInfo\") {\n      pageInfo {\n        endCursor\n        hasNextPage\n        hasPreviousPage\n        startCursor\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5f8e9317f3d4ea9a22cd368f8b8d0c4d";
}

module.exports = ((node/*: any*/)/*: Query<
  useBlockingPaginationFragmentTest2FragmentPaginationQuery$variables,
  useBlockingPaginationFragmentTest2FragmentPaginationQuery$data,
>*/);
