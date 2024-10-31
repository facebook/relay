/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b673277e713696a12a7a8801c17ac46a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$fragmentType: FragmentType;
export type usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$data = $ReadOnlyArray<{|
  +cursor: ?string,
  +node: ?{|
    +__typename: "User",
    +id: string,
    +name: ?string,
  |},
  +$fragmentType: usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$fragmentType,
|}>;
export type usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$key = $ReadOnlyArray<{
  +$data?: usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$data,
  +$fragmentSpreads: usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges",
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
  usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$fragmentType,
  usePrefetchableForwardPaginationFragmentEXPERIMENTALTest_user__edges$data,
>*/);
