/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aa7d0672cdce6825f57f1e10a5c22a18>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ReactRelayPaginationContainerTestNoConnectionOnFragmentUserFragment$fragmentType } from "./ReactRelayPaginationContainerTestNoConnectionOnFragmentUserFragment.graphql";
import type { ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType } from "./ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment.graphql";
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery$variables = {|
  after?: ?string,
  count: number,
  id: string,
  orderby?: ?ReadonlyArray<?string>,
|};
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery$data = {|
  +node: ?{|
    +id: string,
    +$fragmentSpreads: ReactRelayPaginationContainerTestNoConnectionOnFragmentUserFragment$fragmentType,
  |},
  +viewer: ?{|
    +$fragmentSpreads: ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment$fragmentType,
  |},
|};
export type ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery = {|
  response: ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery$data,
  variables: ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "after"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "count"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "orderby"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = [
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
    "name": "orderby",
    "variableName": "orderby"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment"
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "ReactRelayPaginationContainerTestNoConnectionOnFragmentUserFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery",
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
              (v3/*: any*/),
              (v2/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v4/*: any*/),
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
                          (v2/*: any*/),
                          (v3/*: any*/)
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
                "args": (v4/*: any*/),
                "filters": [
                  "orderby"
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
    "cacheID": "e9c46d9da93c0c9d4e342c39c4b1ba95",
    "id": null,
    "metadata": {},
    "name": "ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery",
    "operationKind": "query",
    "text": "query ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery(\n  $after: ID\n  $count: Int!\n  $id: ID!\n  $orderby: [String]\n) {\n  viewer {\n    ...ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment\n  }\n  node(id: $id) {\n    __typename\n    id\n    ...ReactRelayPaginationContainerTestNoConnectionOnFragmentUserFragment\n  }\n}\n\nfragment ReactRelayPaginationContainerTestNoConnectionOnFragmentUserFragment on User {\n  friends(after: $after, first: $count, orderby: $orderby) {\n    edges {\n      node {\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment ReactRelayPaginationContainerTestNoConnectionOnFragmentViewerFragment on Viewer {\n  actor {\n    __typename\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "66bbe4963a808c62bf186f33395775b7";
}

module.exports = ((node/*: any*/)/*: Query<
  ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery$variables,
  ReactRelayPaginationContainerTestNoConnectionOnFragmentUserQuery$data,
>*/);
