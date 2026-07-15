/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f82add4bdc6679ad4deb365d69d55c1c>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type waitForFragmentDataTestOkPluralFragment$fragmentType: FragmentType;
export type waitForFragmentDataTestOkPluralFragment$data = ReadonlyArray<{
  readonly name: ?string,
  readonly $fragmentType: waitForFragmentDataTestOkPluralFragment$fragmentType,
}>;
export type waitForFragmentDataTestOkPluralFragment$key = ReadonlyArray<{
  readonly $data?: waitForFragmentDataTestOkPluralFragment$data,
  readonly $fragmentSpreads: waitForFragmentDataTestOkPluralFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "waitForFragmentDataTestOkPluralFragment",
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
  (node/*:: as any*/).hash = "27b1b1a834949ad358eaf6d1396d3f9d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  waitForFragmentDataTestOkPluralFragment$fragmentType,
  waitForFragmentDataTestOkPluralFragment$data,
>*/);
