/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2d21851e0852dd3a0109d098b68aeae1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$fragmentType } from "./FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment.graphql";
export type FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery$variables = {||};
export type FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +friends: ?{|
        +edges: ?ReadonlyArray<?{|
          +node: ?{|
            +$fragmentSpreads: FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment$fragmentType,
          |},
        |}>,
      |},
    |},
  |},
|};
export type FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery = {|
  response: FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery$data,
  variables: FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "cursor",
  "storageKey": null
},
v2 = {
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
},
v3 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery",
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
                "alias": "friends",
                "args": null,
                "concreteType": "FriendsConnection",
                "kind": "LinkedField",
                "name": "__Viewer_friends_connection",
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
                          {
                            "args": null,
                            "kind": "FragmentSpread",
                            "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment"
                          },
                          (v0/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery",
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
              (v0/*: any*/),
              {
                "alias": null,
                "args": (v3/*: any*/),
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
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "name",
                            "storageKey": null
                          },
                          (v0/*: any*/)
                        ],
                        "storageKey": null
                      },
                      (v1/*: any*/)
                    ],
                    "storageKey": null
                  },
                  (v2/*: any*/)
                ],
                "storageKey": "friends(first:1)"
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "Viewer_friends",
                "kind": "LinkedHandle",
                "name": "friends"
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "a722ba9082a20e95ed461fd70017e783",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "viewer",
            "actor",
            "friends"
          ]
        }
      ]
    },
    "name": "FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery {\n  viewer {\n    actor {\n      __typename\n      friends(first: 1) {\n        edges {\n          node {\n            ...FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment\n            id\n            __typename\n          }\n          cursor\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n      id\n    }\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerOptimisticUpdatesTestFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f9b64d236a796cfb14e99418ead325ba";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery$variables,
  FragmentResourceWithOperationTrackerOptimisticUpdatesTestViewerFriendsQuery$data,
>*/);
