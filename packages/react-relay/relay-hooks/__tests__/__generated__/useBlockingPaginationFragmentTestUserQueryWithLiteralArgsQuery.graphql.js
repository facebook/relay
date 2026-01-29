/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5f766aedba037b882a891998cbc21dee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { useBlockingPaginationFragmentTestUserFragment$fragmentType } from "./useBlockingPaginationFragmentTestUserFragment.graphql";
export type useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery$variables = {|
  after?: ?string,
  before?: ?string,
  first?: ?number,
  id: string,
  last?: ?number,
|};
export type useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: useBlockingPaginationFragmentTestUserFragment$fragmentType,
  |},
|};
export type useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery = {|
  response: useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery$data,
  variables: useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery$variables,
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
  "name": "last"
},
v5 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v6 = {
  "kind": "Literal",
  "name": "orderby",
  "value": [
    "name"
  ]
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
    "kind": "Literal",
    "name": "isViewerFriend",
    "value": true
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
      (v4/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": [
              {
                "kind": "Literal",
                "name": "isViewerFriendLocal",
                "value": true
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
      (v4/*: any*/)
    ],
    "kind": "Operation",
    "name": "useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery",
    "selections": [
      {
        "alias": null,
        "args": (v5/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
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
    ]
  },
  "params": {
    "cacheID": "1b60a3ca0b984dea43db865b72da7c63",
    "id": null,
    "metadata": {},
    "name": "useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery",
    "operationKind": "query",
    "text": "query useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery(\n  $id: ID!\n  $after: ID\n  $first: Int\n  $before: ID\n  $last: Int\n) {\n  node(id: $id) {\n    __typename\n    ...useBlockingPaginationFragmentTestUserFragment_uqCcD\n    id\n  }\n}\n\nfragment useBlockingPaginationFragmentTestNestedUserFragment on User {\n  username\n}\n\nfragment useBlockingPaginationFragmentTestUserFragment_uqCcD on User {\n  id\n  name\n  friends(after: $after, first: $first, before: $before, last: $last, orderby: [\"name\"], isViewerFriend: true) {\n    edges {\n      node {\n        id\n        name\n        ...useBlockingPaginationFragmentTestNestedUserFragment\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n      hasPreviousPage\n      startCursor\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "43b6d41944fcdea59eebc1d5f59fe65c";
}

module.exports = ((node/*: any*/)/*: Query<
  useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery$variables,
  useBlockingPaginationFragmentTestUserQueryWithLiteralArgsQuery$data,
>*/);
