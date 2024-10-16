/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<38f14b632b65c24cc98b62c897ad54bd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestThrowOnFieldErrorFragment$fragmentType: FragmentType;
export type observeFragmentTestThrowOnFieldErrorFragment$data = {|
  +name: ?string,
  +$fragmentType: observeFragmentTestThrowOnFieldErrorFragment$fragmentType,
|};
export type observeFragmentTestThrowOnFieldErrorFragment$key = {
  +$data?: observeFragmentTestThrowOnFieldErrorFragment$data,
  +$fragmentSpreads: observeFragmentTestThrowOnFieldErrorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "observeFragmentTestThrowOnFieldErrorFragment",
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
  (node/*: any*/).hash = "16bab4718dee8683c738530e3e75cc79";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestThrowOnFieldErrorFragment$fragmentType,
  observeFragmentTestThrowOnFieldErrorFragment$data,
>*/);
