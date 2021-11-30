/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a5972f811dc24195a9c6bacce4670bac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$fragmentType = any;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery$variables = {|
  after?: ?string,
  count: number,
  id: string,
  orderby?: ?$ReadOnlyArray<?string>,
  isViewerFriend: boolean,
|};
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserQueryVariables = ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery$variables;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +$fragmentSpreads: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserQueryResponse = ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery$data;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery = {|
  variables: ReactRelayPaginationContainerWithFragmentOwnershipTestUserQueryVariables,
  response: ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery$data,
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
  "name": "count"
},
v2 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v3 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "isViewerFriend"
},
v4 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "orderby"
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v6 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v7 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v8 = {
  "kind": "Variable",
  "name": "orderby",
  "variableName": "orderby"
},
v9 = [
  {
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Variable",
    "name": "first",
    "variableName": "count"
  },
  {
    "kind": "Variable",
    "name": "isViewerFriend",
    "variableName": "isViewerFriend"
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
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
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
            "name": "ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment"
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
      (v3/*: any*/)
    ],
    "kind": "Operation",
    "name": "ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v6/*: any*/),
          (v7/*: any*/),
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
                          (v6/*: any*/),
                          {
                            "condition": "isViewerFriend",
                            "kind": "Condition",
                            "passingValue": true,
                            "selections": [
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "name",
                                "storageKey": null
                              }
                            ]
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
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v9/*: any*/),
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
    "cacheID": "d020e7105d9ea0eb0a39ec2de386cf68",
    "id": null,
    "metadata": {},
    "name": "ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery(\n  $after: ID\n  $count: Int!\n  $id: ID!\n  $orderby: [String]\n  $isViewerFriend: Boolean!\n) {\n  node(id: $id) {\n    id\n    __typename\n    ...ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment_2nnVOB\n  }\n}\n\nfragment ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment_2nnVOB on User {\n  id\n  friends(after: $after, first: $count, orderby: $orderby, isViewerFriend: $isViewerFriend) {\n    edges {\n      node {\n        id\n        ...ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment_G5jjK\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment_G5jjK on User {\n  id\n  name @include(if: $isViewerFriend)\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "46153f91be065033bb3e83f093819f1b";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery$variables,
  ReactRelayPaginationContainerWithFragmentOwnershipTestUserQuery$data,
>*/);
