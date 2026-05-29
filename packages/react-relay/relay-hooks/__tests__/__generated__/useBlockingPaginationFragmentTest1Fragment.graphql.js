/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fb0c56f7124fd26958dbd8e0047c0855>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTest1Fragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentTest1Fragment$data = ReadonlyArray<{
  readonly id: string,
  readonly $fragmentType: useBlockingPaginationFragmentTest1Fragment$fragmentType,
}>;
export type useBlockingPaginationFragmentTest1Fragment$key = ReadonlyArray<{
  readonly $data?: useBlockingPaginationFragmentTest1Fragment$data,
  readonly $fragmentSpreads: useBlockingPaginationFragmentTest1Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "useBlockingPaginationFragmentTest1Fragment",
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
  (node/*:: as any*/).hash = "ff8a7af82662cd77253e7908d8c64d41";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useBlockingPaginationFragmentTest1Fragment$fragmentType,
  useBlockingPaginationFragmentTest1Fragment$data,
>*/);
