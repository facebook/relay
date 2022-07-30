/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4a661289ed359f7d920a27cc232e4e3e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTest1Fragment$fragmentType: FragmentType;
export type usePaginationFragmentTest1Fragment$data = $ReadOnlyArray<{|
  +id: string,
  +$fragmentType: usePaginationFragmentTest1Fragment$fragmentType,
|}>;
export type usePaginationFragmentTest1Fragment$key = $ReadOnlyArray<{
  +$data?: usePaginationFragmentTest1Fragment$data,
  +$fragmentSpreads: usePaginationFragmentTest1Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "usePaginationFragmentTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "336d8ae6ada85aef562c734581f8e84c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  usePaginationFragmentTest1Fragment$fragmentType,
  usePaginationFragmentTest1Fragment$data,
>*/);
