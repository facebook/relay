/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f10f9993727a19eccf6dc6f37a3cf3c2>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest4Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest4Fragment$data = {|
  +username: ?string,
  +$fragmentType: RelayModernStoreTest4Fragment$fragmentType,
|};
export type RelayModernStoreTest4Fragment$key = {
  +$data?: RelayModernStoreTest4Fragment$data,
  +$fragmentSpreads: RelayModernStoreTest4Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernStoreTest4Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "5ef882aa3b46447858182fa2dcb0f05f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernStoreTest4Fragment$fragmentType,
  RelayModernStoreTest4Fragment$data,
>*/);
