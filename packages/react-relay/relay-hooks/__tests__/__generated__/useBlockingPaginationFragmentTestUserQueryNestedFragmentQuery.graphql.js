/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5c6977febcb952ad14e9584270d77c6e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type useBlockingPaginationFragmentTestUserFragment$fragmentType = any;
export type useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery$variables = {|
  id: string,
  after?: ?string,
  first?: ?number,
  before?: ?string,
  last?: ?number,
  orderby?: ?$ReadOnlyArray<?string>,
  isViewerFriend?: ?boolean,
|};
export type useBlockingPaginationFragmentTestUserQueryNestedFragmentQueryVariables = useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery$variables;
export type useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery$data = {|
  +node: ?{|
    +actor: ?{|
      +$fragmentSpreads: useBlockingPaginationFragmentTestUserFragment$fragmentType,
    |},
  |},
|};
export type useBlockingPaginationFragmentTestUserQueryNestedFragmentQueryResponse = useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery$data;
export type useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery = {|
  variables: useBlockingPaginationFragmentTestUserQueryNestedFragmentQueryVariables,
  response: useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery$data,
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
    "name": "useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery",
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
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              {
                "args": [
                  {
                    "kind": "Variable",
                    "name": "isViewerFriendLocal",
                    "variableName": "isViewerFriend"
                  },
                  (v8/*: any*/)
                ],
                "kind": "FragmentSpread",
                "name": "useBlockingPaginationFragmentTestUserFragment"
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
    "argumentDefinitions": [
      (v3/*: any*/),
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/),
      (v5/*: any*/),
      (v6/*: any*/),
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery",
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
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
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
          },
          (v10/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "964ed82a69c07cb16fcef14c8e101210",
    "id": null,
    "metadata": {},
    "name": "useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery",
    "operationKind": "query",
    "text": "query useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery(\n  $id: ID!\n  $after: ID\n  $first: Int\n  $before: ID\n  $last: Int\n  $orderby: [String]\n  $isViewerFriend: Boolean\n) {\n  node(id: $id) {\n    __typename\n    actor {\n      __typename\n      ...useBlockingPaginationFragmentTestUserFragment_2nnVOB\n      id\n    }\n    id\n  }\n}\n\nfragment useBlockingPaginationFragmentTestNestedUserFragment on User {\n  username\n}\n\nfragment useBlockingPaginationFragmentTestUserFragment_2nnVOB on User {\n  id\n  name\n  friends(after: $after, first: $first, before: $before, last: $last, orderby: $orderby, isViewerFriend: $isViewerFriend) {\n    edges {\n      node {\n        id\n        name\n        ...useBlockingPaginationFragmentTestNestedUserFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "19018d89e0c127bfa85e874e07a4b743";
}

module.exports = ((node/*: any*/)/*: Query<
  useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery$variables,
  useBlockingPaginationFragmentTestUserQueryNestedFragmentQuery$data,
>*/);
