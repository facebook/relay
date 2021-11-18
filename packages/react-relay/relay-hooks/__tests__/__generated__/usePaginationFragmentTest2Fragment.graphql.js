/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7bc577498f58543f6ad6aa03a89fcc0a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTest2Fragment$fragmentType: FragmentType;
export type usePaginationFragmentTest2Fragment$ref = usePaginationFragmentTest2Fragment$fragmentType;
export type usePaginationFragmentTest2Fragment$data = {|
  +id: string,
  +$fragmentType: usePaginationFragmentTest2Fragment$fragmentType,
|};
export type usePaginationFragmentTest2Fragment = usePaginationFragmentTest2Fragment$data;
export type usePaginationFragmentTest2Fragment$key = {
  +$data?: usePaginationFragmentTest2Fragment$data,
  +$fragmentSpreads: usePaginationFragmentTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "usePaginationFragmentTest2Fragment",
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
  (node/*: any*/).hash = "0d49cc95e691d8661dc700c5625776da";
}

module.exports = ((node/*: any*/)/*: Fragment<
  usePaginationFragmentTest2Fragment$fragmentType,
  usePaginationFragmentTest2Fragment$data,
>*/);
