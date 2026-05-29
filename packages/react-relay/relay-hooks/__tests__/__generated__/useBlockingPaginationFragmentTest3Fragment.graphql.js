/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c6d28c1f9e1b8dab8d6b7958a38e3c51>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTest3Fragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentTest3Fragment$data = {
  readonly id: string,
  readonly $fragmentType: useBlockingPaginationFragmentTest3Fragment$fragmentType,
};
export type useBlockingPaginationFragmentTest3Fragment$key = {
  readonly $data?: useBlockingPaginationFragmentTest3Fragment$data,
  readonly $fragmentSpreads: useBlockingPaginationFragmentTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useBlockingPaginationFragmentTest3Fragment",
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
  (node/*:: as any*/).hash = "7f61e10c85a362f8e5a7f814a4b92a5a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useBlockingPaginationFragmentTest3Fragment$fragmentType,
  useBlockingPaginationFragmentTest3Fragment$data,
>*/);
