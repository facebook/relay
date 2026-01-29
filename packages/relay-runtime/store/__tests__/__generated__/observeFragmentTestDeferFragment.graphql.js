/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b1026009e096c5f2bfe95420f20b2748>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestDeferFragment$fragmentType: FragmentType;
export type observeFragmentTestDeferFragment$data = {|
  +name: ?string,
  +$fragmentType: observeFragmentTestDeferFragment$fragmentType,
|};
export type observeFragmentTestDeferFragment$key = {
  +$data?: observeFragmentTestDeferFragment$data,
  +$fragmentSpreads: observeFragmentTestDeferFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "observeFragmentTestDeferFragment",
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
  (node/*: any*/).hash = "68e7df223a60785dce3407b24495e4ba";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestDeferFragment$fragmentType,
  observeFragmentTestDeferFragment$data,
>*/);
