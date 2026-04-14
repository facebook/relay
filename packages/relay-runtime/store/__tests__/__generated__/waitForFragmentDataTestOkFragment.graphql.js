/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<51c40ea4c67ac597d75ce49c7a17c3d5>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type waitForFragmentDataTestOkFragment$fragmentType: FragmentType;
export type waitForFragmentDataTestOkFragment$data = {|
  +name: ?string,
  +$fragmentType: waitForFragmentDataTestOkFragment$fragmentType,
|};
export type waitForFragmentDataTestOkFragment$key = {
  +$data?: waitForFragmentDataTestOkFragment$data,
  +$fragmentSpreads: waitForFragmentDataTestOkFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "waitForFragmentDataTestOkFragment",
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
  (node/*:: as any*/).hash = "0b368b9cbf619d005c378bd31754d026";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  waitForFragmentDataTestOkFragment$fragmentType,
  waitForFragmentDataTestOkFragment$data,
>*/);
