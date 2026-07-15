/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d8d1cee7e6d3cc463dccb43aaca401fb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestDeferFragment$fragmentType: FragmentType;
export type observeFragmentTestDeferFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: observeFragmentTestDeferFragment$fragmentType,
};
export type observeFragmentTestDeferFragment$key = {
  readonly $data?: observeFragmentTestDeferFragment$data,
  readonly $fragmentSpreads: observeFragmentTestDeferFragment$fragmentType,
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
  (node/*:: as any*/).hash = "68e7df223a60785dce3407b24495e4ba";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  observeFragmentTestDeferFragment$fragmentType,
  observeFragmentTestDeferFragment$data,
>*/);
