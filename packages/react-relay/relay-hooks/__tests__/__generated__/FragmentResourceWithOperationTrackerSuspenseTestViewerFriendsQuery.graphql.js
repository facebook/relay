/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1b4c860e504451d177af8ae43a4eb780>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { FragmentResourceWithOperationTrackerSuspenseTestFragment$fragmentType } from "./FragmentResourceWithOperationTrackerSuspenseTestFragment.graphql";
export type FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery$variables = {||};
export type FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +friends: ?{|
        +edges: ?ReadonlyArray<?{|
          +node: ?{|
            +$fragmentSpreads: FragmentResourceWithOperationTrackerSuspenseTestFragment$fragmentType,
          |},
        |}>,
      |},
    |},
  |},
|};
export type FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery = {|
  response: FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery$data,
  variables: FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery$variables,
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
    "name": "FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery",
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
                            "name": "FragmentResourceWithOperationTrackerSuspenseTestFragment"
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
    "name": "FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery",
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
    "cacheID": "1f101fa9f94518f5b602545fa8906679",
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
    "name": "FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery",
    "operationKind": "query",
    "text": "query FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery {\n  viewer {\n    actor {\n      __typename\n      friends(first: 1) {\n        edges {\n          node {\n            ...FragmentResourceWithOperationTrackerSuspenseTestFragment\n            id\n            __typename\n          }\n          cursor\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n      id\n    }\n  }\n}\n\nfragment FragmentResourceWithOperationTrackerSuspenseTestFragment on User {\n  id\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ed31499a862a024df8808467d4b24601";
}

module.exports = ((node/*: any*/)/*: Query<
  FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery$variables,
  FragmentResourceWithOperationTrackerSuspenseTestViewerFriendsQuery$data,
>*/);
