/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7a81df39a17686cf5c0d2bba6442e81e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import type { usePaginationFragmentCatchTestRootCatchFragment$fragmentType } from "./usePaginationFragmentCatchTestRootCatchFragment.graphql";
export type usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery$variables = {|
  after?: ?string,
  first?: ?number,
  id: string,
|};
export type usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: usePaginationFragmentCatchTestRootCatchFragment$fragmentType,
  |},
|};
export type usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery = {|
  response: usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery$data,
  variables: usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery$variables,
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
    "name": "first"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
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
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
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
    "variableName": "first"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "usePaginationFragmentCatchTestRootCatchFragment"
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          (v3/*:: as any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v4/*:: as any*/),
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
                          (v2/*:: as any*/),
                          (v3/*:: as any*/)
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
                "args": (v4/*:: as any*/),
                "filters": null,
                "handle": "connection",
                "key": "usePaginationFragmentCatchTestRootCatchFragment__friends",
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
    "cacheID": "8610d24acee5d5cd19ceb3c363acbaf5",
    "id": null,
    "metadata": {},
    "name": "usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery",
    "operationKind": "query",
    "text": "query usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery(\n  $after: ID\n  $first: Int\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...usePaginationFragmentCatchTestRootCatchFragment\n    id\n  }\n}\n\nfragment usePaginationFragmentCatchTestRootCatchFragment on User {\n  friends(after: $after, first: $first) {\n    edges {\n      node {\n        __typename\n        id\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  id\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "fbb2b3fa3b6a1eb0829f97e6cfc55708";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery$variables,
  usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery$data,
>*/);
