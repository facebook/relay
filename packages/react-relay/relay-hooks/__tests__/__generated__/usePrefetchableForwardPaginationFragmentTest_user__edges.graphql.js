/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0b0f99b50e259a2256ba296cde505715>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType: FragmentType;
export type usePrefetchableForwardPaginationFragmentTest_user__edges$data = ReadonlyArray<{
  readonly cursor: ?string,
  readonly node: ?{
    readonly __typename: "User",
    readonly id: string,
    readonly name: ?string,
  },
  readonly $fragmentType: usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType,
}>;
export type usePrefetchableForwardPaginationFragmentTest_user__edges$key = ReadonlyArray<{
  readonly $data?: usePrefetchableForwardPaginationFragmentTest_user__edges$data,
  readonly $fragmentSpreads: usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "usePrefetchableForwardPaginationFragmentTest_user__edges",
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
          "name": "id",
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
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
  "type": "FriendsEdge",
  "abstractKey": null
};

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType,
  usePrefetchableForwardPaginationFragmentTest_user__edges$data,
>*/);
