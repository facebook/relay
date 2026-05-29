/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b111b2e9921b62a8a71d20928982c162>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest2Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest2Fragment$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayStoreUtilsTest2Fragment$fragmentType,
};
export type RelayStoreUtilsTest2Fragment$key = {
  readonly $data?: RelayStoreUtilsTest2Fragment$data,
  readonly $fragmentSpreads: RelayStoreUtilsTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayStoreUtilsTest2Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "0651864d5b12926d4a8350efac4ebd53";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayStoreUtilsTest2Fragment$fragmentType,
  RelayStoreUtilsTest2Fragment$data,
>*/);
