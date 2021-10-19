/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f16c254d97f666d68aff9d8477aebd32>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$fragmentType: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$ref;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment = {|
  +id: string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +node: ?{|
        +id: string,
        +$fragmentRefs: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment$ref,
      |},
    |}>,
  |},
  +$refType: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$ref,
|};
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$data = ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment;
export type ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$key = {
  +$data?: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$data,
  +$fragmentRefs: ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
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
      "name": "count"
    },
    {
      "defaultValue": false,
      "kind": "LocalArgument",
      "name": "isViewerFriendLocal"
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
        "count": "count",
        "cursor": "after",
        "direction": "forward",
        "path": [
          "friends"
        ]
      }
    ]
  },
  "name": "ReactRelayPaginationContainerWithFragmentOwnershipTestUserFragment",
  "selections": [
    (v0/*: any*/),
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
                (v0/*: any*/),
                {
                  "args": [
                    {
                      "kind": "Variable",
                      "name": "isViewerFriendLocal",
                      "variableName": "isViewerFriendLocal"
                    }
                  ],
                  "kind": "FragmentSpread",
                  "name": "ReactRelayPaginationContainerWithFragmentOwnershipTestUserFriendFragment"
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
  (node/*: any*/).hash = "25074f275d8cdaa1298ea0d300df1a98";
}

module.exports = node;
