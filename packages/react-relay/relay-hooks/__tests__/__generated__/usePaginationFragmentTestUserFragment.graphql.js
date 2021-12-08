/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<63f7f95eaeac7ba2fe35a926ffb2d8c0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
type usePaginationFragmentTestNestedUserFragment$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTestUserFragment$fragmentType: FragmentType;
export type usePaginationFragmentTestUserFragment$ref = usePaginationFragmentTestUserFragment$fragmentType;
type usePaginationFragmentTestUserFragmentPaginationQuery$variables = any;
export type usePaginationFragmentTestUserFragment$data = {|
  +id: string,
  +name: ?string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +name: ?string,
        +$fragmentSpreads: usePaginationFragmentTestNestedUserFragment$fragmentType,
      |},
    |}>,
  |},
  +$fragmentType: usePaginationFragmentTestUserFragment$fragmentType,
|};
export type usePaginationFragmentTestUserFragment = usePaginationFragmentTestUserFragment$data;
export type usePaginationFragmentTestUserFragment$key = {
  +$data?: usePaginationFragmentTestUserFragment$data,
  +$fragmentSpreads: usePaginationFragmentTestUserFragment$fragmentType,
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
    },
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scale"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": null,
        "cursor": null,
        "direction": "bidirectional",
        "path": (v0/*: any*/)
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
      "operation": require('./usePaginationFragmentTestUserFragmentPaginationQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "usePaginationFragmentTestUserFragment",
  "selections": [
    (v1/*: any*/),
    (v2/*: any*/),
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
                (v1/*: any*/),
                (v2/*: any*/),
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "usePaginationFragmentTestNestedUserFragment"
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
  (node/*: any*/).hash = "fe5dabc8eef251e3032e850d1c26f222";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  usePaginationFragmentTestUserFragment$fragmentType,
  usePaginationFragmentTestUserFragment$data,
  usePaginationFragmentTestUserFragmentPaginationQuery$variables,
>*/);
