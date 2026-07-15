/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9ed951d89e98616dfdd26d467c0ae12c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, PrefetchableRefetchableFragment } from 'relay-runtime';
import type { usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType } from "./usePrefetchableForwardPaginationFragmentTest_user__edges.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type usePrefetchableForwardPaginationFragmentTest_user$fragmentType: FragmentType;
type usePrefetchableForwardPaginationFragmentRefetchQuery$variables = any;
type usePrefetchableForwardPaginationFragmentTest_user__edges$data = any;
export type usePrefetchableForwardPaginationFragmentTest_user$data = {
  readonly friends: ?{
    readonly edges: ?ReadonlyArray<?{
      readonly $fragmentSpreads: usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType,
    }>,
    readonly pageInfo: ?{
      readonly endCursor: ?string,
      readonly hasNextPage: ?boolean,
      readonly hasPreviousPage: ?boolean,
      readonly startCursor: ?string,
    },
  },
  readonly id: string,
  readonly $fragmentType: usePrefetchableForwardPaginationFragmentTest_user$fragmentType,
};
export type usePrefetchableForwardPaginationFragmentTest_user$key = {
  readonly $data?: usePrefetchableForwardPaginationFragmentTest_user$data,
  readonly $fragmentSpreads: usePrefetchableForwardPaginationFragmentTest_user$fragmentType,
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
      "operation": require('./usePrefetchableForwardPaginationFragmentRefetchQuery.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      },
      "edgesFragment": require('./usePrefetchableForwardPaginationFragmentTest_user__edges.graphql')
    }
  },
  "name": "usePrefetchableForwardPaginationFragmentTest_user",
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
              "name": "usePrefetchableForwardPaginationFragmentTest_user__edges"
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
  (node/*:: as any*/).hash = "b556c89ea274871519ed4779f197956d";
}

module.exports = ((node/*:: as any*/)/*:: as PrefetchableRefetchableFragment<
  usePrefetchableForwardPaginationFragmentTest_user$fragmentType,
  usePrefetchableForwardPaginationFragmentTest_user$data,
  usePrefetchableForwardPaginationFragmentTest_user__edges$data,
  usePrefetchableForwardPaginationFragmentRefetchQuery$variables,
>*/);
