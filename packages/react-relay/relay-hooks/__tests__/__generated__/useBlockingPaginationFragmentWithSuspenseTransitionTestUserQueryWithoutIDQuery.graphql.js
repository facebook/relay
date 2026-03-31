/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2f9235c3890194af32c52831cf14c607>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$fragmentType } from "./useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment.graphql";
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery$variables = {|
  after?: ?string,
  before?: ?string,
  first?: ?number,
  isViewerFriend?: ?boolean,
  last?: ?number,
  orderby?: ?ReadonlyArray<?string>,
|};
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +$fragmentSpreads: useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$fragmentType,
    |},
  |},
|};
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery = {|
  response: useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery$data,
  variables: useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery$variables,
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
  (v6/*:: as any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*:: as any*/),
      (v1/*:: as any*/),
      (v2/*:: as any*/),
      (v3/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery",
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
                  (v6/*:: as any*/)
                ],
                "kind": "FragmentSpread",
                "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment"
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
      (v0/*:: as any*/),
      (v2/*:: as any*/),
      (v1/*:: as any*/),
      (v4/*:: as any*/),
      (v5/*:: as any*/),
      (v3/*:: as any*/)
    ],
    "kind": "Operation",
    "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery",
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
              (v7/*:: as any*/),
              (v8/*:: as any*/),
              {
                "kind": "InlineFragment",
                "selections": [
                  (v9/*:: as any*/),
                  {
                    "alias": null,
                    "args": (v10/*:: as any*/),
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
                              (v8/*:: as any*/),
                              (v9/*:: as any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "username",
                                "storageKey": null
                              },
                              (v7/*:: as any*/)
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
                    "args": (v10/*:: as any*/),
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
    "cacheID": "ee4c18a352588d2e5a689d5807148b78",
    "id": null,
    "metadata": {},
    "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery",
    "operationKind": "query",
    "text": "query useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery(\n  $after: ID\n  $first: Int\n  $before: ID\n  $last: Int\n  $orderby: [String]\n  $isViewerFriend: Boolean\n) {\n  viewer {\n    actor {\n      __typename\n      ...useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment_2nnVOB\n      id\n    }\n  }\n}\n\nfragment useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment on User {\n  username\n}\n\nfragment useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment_2nnVOB on User {\n  id\n  name\n  friends(after: $after, first: $first, before: $before, last: $last, orderby: $orderby, isViewerFriend: $isViewerFriend) {\n    edges {\n      node {\n        id\n        name\n        ...useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "82c3921e9fe483d213ac9b7581afd1de";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery$variables,
  useBlockingPaginationFragmentWithSuspenseTransitionTestUserQueryWithoutIDQuery$data,
>*/);
