/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<42d7bf0c3a444da87bca8f9ec4ee1438>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTest1Fragment$fragmentType: FragmentType;
export type usePaginationFragmentTest1Fragment$data = ReadonlyArray<{
  readonly id: string,
  readonly $fragmentType: usePaginationFragmentTest1Fragment$fragmentType,
}>;
export type usePaginationFragmentTest1Fragment$key = ReadonlyArray<{
  readonly $data?: usePaginationFragmentTest1Fragment$data,
  readonly $fragmentSpreads: usePaginationFragmentTest1Fragment$fragmentType,
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
  (node/*:: as any*/).hash = "336d8ae6ada85aef562c734581f8e84c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  usePaginationFragmentTest1Fragment$fragmentType,
  usePaginationFragmentTest1Fragment$data,
>*/);
