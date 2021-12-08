/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<de9f1ee2d0ca061335271ad823e4b200>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTest2Fragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentTest2Fragment$ref = useBlockingPaginationFragmentTest2Fragment$fragmentType;
type useBlockingPaginationFragmentTest2FragmentPaginationQuery$variables = any;
export type useBlockingPaginationFragmentTest2Fragment$data = {|
  +id: string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +$fragmentType: useBlockingPaginationFragmentTest2Fragment$fragmentType,
|};
export type useBlockingPaginationFragmentTest2Fragment = useBlockingPaginationFragmentTest2Fragment$data;
export type useBlockingPaginationFragmentTest2Fragment$key = {
  +$data?: useBlockingPaginationFragmentTest2Fragment$data,
  +$fragmentSpreads: useBlockingPaginationFragmentTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  "friends"
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "after"
    },
    {
      "kind": "RootArgument",
      "name": "before"
    },
    {
      "kind": "RootArgument",
      "name": "first"
    },
    {
      "kind": "RootArgument",
      "name": "isViewerFriendLocal"
    },
    {
      "kind": "RootArgument",
      "name": "last"
    },
    {
      "kind": "RootArgument",
      "name": "orderby"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "bidirectional",
        "path": (v0/*: any*/),
        "stream": true
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": {
          "count": "last",
          "cursor": "before"
        },
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./useBlockingPaginationFragmentTest2FragmentPaginationQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "useBlockingPaginationFragmentTest2Fragment",
  "selections": [
    (v1/*: any*/),
    {
      "alias": "friends",
      "args": [
        {
          "kind": "Variable",
          "name": "isViewerFriend",
          "variableName": "isViewerFriendLocal"
        },
        {
          "kind": "Variable",
          "name": "orderby",
          "variableName": "orderby"
        }
      ],
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "__UserFragment_friends_connection",
      "plural": false,
      "selections": [
        {
          "kind": "Stream",
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
                    (v1/*: any*/),
                    {
                      "alias": null,
                      "args": null,
                      "kind": "ScalarField",
                      "name": "__typename",
                      "storageKey": null
                    }
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
            }
          ]
        },
        {
          "kind": "Defer",
          "selections": [
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
          ]
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5f8e9317f3d4ea9a22cd368f8b8d0c4d";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  useBlockingPaginationFragmentTest2Fragment$fragmentType,
  useBlockingPaginationFragmentTest2Fragment$data,
  useBlockingPaginationFragmentTest2FragmentPaginationQuery$variables,
>*/);
