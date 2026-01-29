/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b948504c815cc854ba422e94d9782f1e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType: FragmentType;
export type usePrefetchableForwardPaginationFragmentTest_user__edges$data = ReadonlyArray<{|
  +cursor: ?string,
  +node: ?{|
    +__typename: "User",
    +id: string,
    +name: ?string,
  |},
  +$fragmentType: usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType,
|}>;
export type usePrefetchableForwardPaginationFragmentTest_user__edges$key = ReadonlyArray<{
  +$data?: usePrefetchableForwardPaginationFragmentTest_user__edges$data,
  +$fragmentSpreads: usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  usePrefetchableForwardPaginationFragmentTest_user__edges$fragmentType,
  usePrefetchableForwardPaginationFragmentTest_user__edges$data,
>*/);
