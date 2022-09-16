/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<07b2091729ebf2fbf95e6743292a75bc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest2Fragment$fragmentType: FragmentType;
export type RelayStoreUtilsTest2Fragment$data = {|
  +name: ?string,
  +$fragmentType: RelayStoreUtilsTest2Fragment$fragmentType,
|};
export type RelayStoreUtilsTest2Fragment$key = {
  +$data?: RelayStoreUtilsTest2Fragment$data,
  +$fragmentSpreads: RelayStoreUtilsTest2Fragment$fragmentType,
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
  (node/*: any*/).hash = "0651864d5b12926d4a8350efac4ebd53";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayStoreUtilsTest2Fragment$fragmentType,
  RelayStoreUtilsTest2Fragment$data,
>*/);
