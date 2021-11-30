/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a008dd595a49b1f50e3a85a8738e1b4b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$fragmentType = any;
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$variables = {|
  after?: ?string,
  before?: ?string,
  first?: ?number,
  isViewerFriendLocal?: ?boolean,
  last?: ?number,
  orderby?: ?$ReadOnlyArray<?string>,
  id: string,
|};
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQueryVariables = useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$variables;
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$fragmentType,
  |},
|};
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQueryResponse = useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$data;
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery = {|
  variables: useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQueryVariables,
  response: useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$data,
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
    "variableName": "isViewerFriendLocal"
  },
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "last"
  },
  (v8/*: any*/)
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
    "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery",
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
            "args": [
              {
                "kind": "Variable",
                "name": "isViewerFriendLocal",
                "variableName": "isViewerFriendLocal"
              },
              (v8/*: any*/)
            ],
            "kind": "FragmentSpread",
            "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment"
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
    "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery",
    "selections": [
      {
        "alias": null,
        "args": (v7/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v9/*: any*/),
          (v10/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v11/*: any*/),
              {
                "alias": null,
                "args": (v12/*: any*/),
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
                          (v10/*: any*/),
                          (v11/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "username",
                            "storageKey": null
                          },
                          (v9/*: any*/)
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
                "args": (v12/*: any*/),
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
    "cacheID": "51ceb213e1f125bfa7a58f91f7dcc59f",
    "id": null,
    "metadata": {},
    "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery",
    "operationKind": "query",
    "text": "query useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery(\n  $after: ID\n  $before: ID\n  $first: Int\n  $isViewerFriendLocal: Boolean = false\n  $last: Int\n  $orderby: [String]\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment_i1SEQ\n    id\n  }\n}\n\nfragment useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment on User {\n  username\n}\n\nfragment useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment_i1SEQ on User {\n  id\n  name\n  friends(after: $after, first: $first, before: $before, last: $last, orderby: $orderby, isViewerFriend: $isViewerFriendLocal) {\n    edges {\n      node {\n        id\n        name\n        ...useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f40001b7b963988467bb56b398ac1e1a";
}

module.exports = ((node/*: any*/)/*: Query<
  useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$variables,
  useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$data,
>*/);
