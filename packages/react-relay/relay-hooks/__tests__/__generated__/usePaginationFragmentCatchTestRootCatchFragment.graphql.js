/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<32f1e5483f7f2865ffecba7b9b260c7f>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType, Result } from "relay-runtime";
declare export opaque type usePaginationFragmentCatchTestRootCatchFragment$fragmentType: FragmentType;
type usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery$variables = any;
export type usePaginationFragmentCatchTestRootCatchFragment$data = Result<{|
  +friends: ?{|
    +edges: ?ReadonlyArray<?{|
      +node: ?{|
        +__typename: "User",
      |},
    |}>,
  |},
  +id: string,
  +$fragmentType: usePaginationFragmentCatchTestRootCatchFragment$fragmentType,
|}, unknown>;
export type usePaginationFragmentCatchTestRootCatchFragment$key = {
  +$data?: usePaginationFragmentCatchTestRootCatchFragment$data,
  +$fragmentSpreads: usePaginationFragmentCatchTestRootCatchFragment$fragmentType,
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
      "name": "first"
    }
  ],
  "kind": "Fragment",
  "metadata": {
    "catchTo": "RESULT",
    "connection": [
      {
        "count": "first",
        "cursor": "after",
        "direction": "forward",
        "path": (v0/*:: as any*/)
      }
    ],
    "refetch": {
      "connection": {
        "forward": {
          "count": "first",
          "cursor": "after"
        },
        "backward": null,
        "path": (v0/*:: as any*/)
      },
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "usePaginationFragmentCatchTestRootCatchFragment",
  "selections": [
    {
      "alias": "friends",
      "args": null,
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "__usePaginationFragmentCatchTestRootCatchFragment__friends_connection",
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
  (node/*:: as any*/).hash = "fbb2b3fa3b6a1eb0829f97e6cfc55708";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  usePaginationFragmentCatchTestRootCatchFragment$fragmentType,
  usePaginationFragmentCatchTestRootCatchFragment$data,
  usePaginationFragmentCatchTestRootCatchRefetchableFragmentQuery$variables,
>*/);
