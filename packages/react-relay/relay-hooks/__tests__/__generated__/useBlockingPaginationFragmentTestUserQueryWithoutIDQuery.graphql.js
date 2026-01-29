/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<79034ce192ffb051556e457959a145eb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useBlockingPaginationFragmentTestUserFragment$fragmentType } from "./useBlockingPaginationFragmentTestUserFragment.graphql";
export type useBlockingPaginationFragmentTestUserQueryWithoutIDQuery$variables = {|
  after?: ?string,
  before?: ?string,
  first?: ?number,
  isViewerFriend?: ?boolean,
  last?: ?number,
  orderby?: ?ReadonlyArray<?string>,
|};
export type useBlockingPaginationFragmentTestUserQueryWithoutIDQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentSpreads: useBlockingPaginationFragmentTestUserFragment$fragmentType,
    |},
  |},
|};
export type useBlockingPaginationFragmentTestUserQueryWithoutIDQuery = {|
  response: useBlockingPaginationFragmentTestUserQueryWithoutIDQuery$data,
  variables: useBlockingPaginationFragmentTestUserQueryWithoutIDQuery$variables,
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
  "name": "isViewerFriend"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "last"
},
v5 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderby"
},
v6 = {
  "kind": "Variable",
  "name": "orderby",
  "variableName": "orderby"
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v8 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v9 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
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
    "variableName": "isViewerFriend"
  },
  {
    "kind": "Variable",
    "name": "last",
    "variableName": "last"
  },
  (v6/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/),
      (v2/*: any*/),
      (v3/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useBlockingPaginationFragmentTestUserQueryWithoutIDQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
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
                  (v6/*: any*/)
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
      (v0/*: any*/),
      (v2/*: any*/),
      (v1/*: any*/),
      (v4/*: any*/),
      (v5/*: any*/),
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "useBlockingPaginationFragmentTestUserQueryWithoutIDQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
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
              (v7/*: any*/),
              (v8/*: any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v9/*: any*/),
                  {
                    "alias": null,
                    "args": (v10/*: any*/),
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
                              (v8/*: any*/),
                              (v9/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "username",
                                "storageKey": null
                              },
                              (v7/*: any*/)
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
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0df4e69dbe3e8b4e4441fa513174eb52",
    "id": null,
    "metadata": {},
    "name": "useBlockingPaginationFragmentTestUserQueryWithoutIDQuery",
    "operationKind": "query",
    "text": "query useBlockingPaginationFragmentTestUserQueryWithoutIDQuery(\n  $after: ID\n  $first: Int\n  $before: ID\n  $last: Int\n  $orderby: [String]\n  $isViewerFriend: Boolean\n) {\n  viewer {\n    actor {\n      __typename\n      ...useBlockingPaginationFragmentTestUserFragment_2nnVOB\n      id\n    }\n  }\n}\n\nfragment useBlockingPaginationFragmentTestNestedUserFragment on User {\n  username\n}\n\nfragment useBlockingPaginationFragmentTestUserFragment_2nnVOB on User {\n  id\n  name\n  friends(after: $after, first: $first, before: $before, last: $last, orderby: $orderby, isViewerFriend: $isViewerFriend) {\n    edges {\n      node {\n        id\n        name\n        ...useBlockingPaginationFragmentTestNestedUserFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "259619db11a4a82a8c105f3462338e2b";
}

module.exports = ((node/*: any*/)/*: Query<
  useBlockingPaginationFragmentTestUserQueryWithoutIDQuery$variables,
  useBlockingPaginationFragmentTestUserQueryWithoutIDQuery$data,
>*/);
