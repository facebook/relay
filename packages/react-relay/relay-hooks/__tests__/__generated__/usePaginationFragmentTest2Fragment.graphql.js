/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<adccf5e7cfa2758944748041ca91d881>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type usePaginationFragmentTest2Fragment$ref: FragmentReference;
declare export opaque type usePaginationFragmentTest2Fragment$fragmentType: usePaginationFragmentTest2Fragment$ref;
export type usePaginationFragmentTest2Fragment = {|
  +id: string,
  +$refType: usePaginationFragmentTest2Fragment$ref,
|};
export type usePaginationFragmentTest2Fragment$data = usePaginationFragmentTest2Fragment;
export type usePaginationFragmentTest2Fragment$key = {
  +$data?: usePaginationFragmentTest2Fragment$data,
  +$fragmentRefs: usePaginationFragmentTest2Fragment$ref,
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

module.exports = node;
