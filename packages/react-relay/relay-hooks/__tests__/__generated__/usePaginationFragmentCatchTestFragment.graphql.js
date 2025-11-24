/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7851e90d0a341de0a38cf41b25d4832f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType, Result } from "relay-runtime";
declare export opaque type usePaginationFragmentCatchTestFragment$fragmentType: FragmentType;
type usePaginationFragmentCatchTestRefetchableFragmentQuery$variables = any;
export type usePaginationFragmentCatchTestFragment$data = {|
  +friends: Result<?{|
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +__typename: "User",
      |},
    |}>,
  |}, unknown>,
  +id: string,
  +$fragmentType: usePaginationFragmentCatchTestFragment$fragmentType,
|};
export type usePaginationFragmentCatchTestFragment$key = {
  +$data?: usePaginationFragmentCatchTestFragment$data,
  +$fragmentSpreads: usePaginationFragmentCatchTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = [
  "friends",
  "value"
];
return {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "after"
    },
    {
      "kind": "RootArgument",
      "name": "first"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "connection": [
      {
        "count": "first",
        "cursor": "after",
        "direction": "forward",
        "path": (v0/*: any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": null,
        "path": (v0/*: any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./usePaginationFragmentCatchTestRefetchableFragmentQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "usePaginationFragmentCatchTestFragment",
  "selections": [
    {
      "kind": "CatchField",
      "field": {
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
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "node",
                "plural": false,
                "selections": [
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
      },
      "to": "RESULT"
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
  (node/*: any*/).hash = "9891621f45f6e7e053b94ff3999fd7d1";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  usePaginationFragmentCatchTestFragment$fragmentType,
  usePaginationFragmentCatchTestFragment$data,
  usePaginationFragmentCatchTestRefetchableFragmentQuery$variables,
>*/);
