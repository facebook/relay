/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<43dd6048fb8a8d2148dc145630c926ac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceSemanticNonNullTestFragment2$fragmentType: FragmentType;
export type FragmentResourceSemanticNonNullTestFragment2$data = {|
  +name: ?string,
  +$fragmentType: FragmentResourceSemanticNonNullTestFragment2$fragmentType,
|};
export type FragmentResourceSemanticNonNullTestFragment2$key = {
  +$data?: FragmentResourceSemanticNonNullTestFragment2$data,
  +$fragmentSpreads: FragmentResourceSemanticNonNullTestFragment2$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceSemanticNonNullTestFragment2",
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
  (node/*: any*/).hash = "4666ac08008cb843a0a50695abc8df0f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceSemanticNonNullTestFragment2$fragmentType,
  FragmentResourceSemanticNonNullTestFragment2$data,
>*/);
