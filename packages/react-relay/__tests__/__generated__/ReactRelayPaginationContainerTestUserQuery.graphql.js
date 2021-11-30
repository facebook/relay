/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f9190a3bbb1d79af6b97a5034c7007ef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type ReactRelayPaginationContainerTestUserFragment$fragmentType = any;
export type ReactRelayPaginationContainerTestUserQuery$variables = {|
  after?: ?string,
  count: number,
  id: string,
  orderby?: ?$ReadOnlyArray<?string>,
  isViewerFriend?: ?boolean,
|};
export type ReactRelayPaginationContainerTestUserQueryVariables = ReactRelayPaginationContainerTestUserQuery$variables;
export type ReactRelayPaginationContainerTestUserQuery$data = {|
  +node: ?{|
    +id: string,
    +__typename: string,
    +$fragmentSpreads: ReactRelayPaginationContainerTestUserFragment$fragmentType,
  |},
|};
export type ReactRelayPaginationContainerTestUserQueryResponse = ReactRelayPaginationContainerTestUserQuery$data;
export type ReactRelayPaginationContainerTestUserQuery = {|
  variables: ReactRelayPaginationContainerTestUserQueryVariables,
  response: ReactRelayPaginationContainerTestUserQuery$data,
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
    "name": "ReactRelayPaginationContainerTestUserQuery",
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
            "name": "ReactRelayPaginationContainerTestUserFragment"
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
    "name": "ReactRelayPaginationContainerTestUserQuery",
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
    "cacheID": "76fa68b81ef7a4b249c3906ad15e6def",
    "id": null,
    "metadata": {},
    "name": "ReactRelayPaginationContainerTestUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayPaginationContainerTestUserQuery(\n  $after: ID\n  $count: Int!\n  $id: ID!\n  $orderby: [String]\n  $isViewerFriend: Boolean\n) {\n  node(id: $id) {\n    id\n    __typename\n    ...ReactRelayPaginationContainerTestUserFragment_2nnVOB\n  }\n}\n\nfragment ReactRelayPaginationContainerTestUserFragment_2nnVOB on User {\n  id\n  friends(after: $after, first: $count, orderby: $orderby, isViewerFriend: $isViewerFriend) {\n    edges {\n      node {\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "50a3bd82c5fad5ead1ce004df8427725";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayPaginationContainerTestUserQuery$variables,
  ReactRelayPaginationContainerTestUserQuery$data,
>*/);
