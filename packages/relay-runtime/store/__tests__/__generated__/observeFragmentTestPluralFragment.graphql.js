/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<59d9a5a1a1d9f27c7d2919e060bf9485>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type observeFragmentTestPluralFragment$fragmentType: FragmentType;
export type observeFragmentTestPluralFragment$data = ReadonlyArray<{
  readonly name: ?string,
  readonly $fragmentType: observeFragmentTestPluralFragment$fragmentType,
}>;
export type observeFragmentTestPluralFragment$key = ReadonlyArray<{
  readonly $data?: observeFragmentTestPluralFragment$data,
  readonly $fragmentSpreads: observeFragmentTestPluralFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "observeFragmentTestPluralFragment",
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
  (node/*:: as any*/).hash = "3b473578ee9b2f35ed7214e714f68334";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  observeFragmentTestPluralFragment$fragmentType,
  observeFragmentTestPluralFragment$data,
>*/);
