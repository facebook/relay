/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9ad24597114aef25a9a09bf88d0c0cdc>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType } from "./useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$fragmentType: FragmentType;
type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$variables = any;
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$data = {|
  +friends: ?{|
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +id: string,
        +name: ?string,
        +$fragmentSpreads: useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType,
      |},
    |}>,
  |},
  +id: string,
  +name: ?string,
  +$fragmentType: useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$fragmentType,
|};
export type useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$key = {
  +$data?: useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$data,
  +$fragmentSpreads: useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$fragmentType,
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
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
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
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "isViewerFriendLocal"
    },
    {
      "kind": "RootArgument",
      "name": "last"
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
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
        "path": (v0/*:: as any*/)
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
        "path": (v0/*:: as any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment",
  "selections": [
    (v1/*:: as any*/),
    (v2/*:: as any*/),
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
                (v1/*:: as any*/),
                (v2/*:: as any*/),
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment"
                },
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
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "f40001b7b963988467bb56b398ac1e1a";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$fragmentType,
  useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragment$data,
  useBlockingPaginationFragmentWithSuspenseTransitionTestUserFragmentPaginationQuery$variables,
>*/);
