/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<369c689b8624b2aa4e3cea4ad88d864a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, PrefetchableRefetchableFragment } from 'relay-runtime';
import type { usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$fragmentType } from "./usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$fragmentType: FragmentType;
type usePrefetchableForwardPaginationFragmentRefetchQuery$variables = any;
type usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$data = any;
export type usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$data = {|
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +$fragmentSpreads: usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$fragmentType,
    |}>,
    +pageInfo: ?{|
      +endCursor: ?string,
      +hasNextPage: ?boolean,
      +hasPreviousPage: ?boolean,
      +startCursor: ?string,
    |},
  |},
  +id: string,
  +$fragmentType: usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$fragmentType,
|};
export type usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$key = {
  +$data?: usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$data,
  +$fragmentSpreads: usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  "friends"
];
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
      "name": "last"
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
      "operation": require('./usePrefetchableForwardPaginationFragmentRefetchQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      },
      "edgesFragment": require('./usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges.graphql')
    }
  },
  "name": "usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user",
  "selections": [
    {
      "alias": "friends",
      "args": null,
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
              "args": null,
              "kind": "FragmentSpread",
              "name": "usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges"
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
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "809455a8d7ada67cb84f3d111f6c6010";
}

module.exports = ((node/*: any*/)/*: PrefetchableRefetchableFragment<
  usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$fragmentType,
  usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user$data,
  usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$data,
  usePrefetchableForwardPaginationFragmentRefetchQuery$variables,
>*/);
