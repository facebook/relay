/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9410e1e5036579f4b6eb2af9b4e8f00e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type usePaginationFragmentTest1Fragment$ref: FragmentReference;
declare export opaque type usePaginationFragmentTest1Fragment$fragmentType: usePaginationFragmentTest1Fragment$ref;
export type usePaginationFragmentTest1Fragment = $ReadOnlyArray<{|
  +id: string,
  +$refType: usePaginationFragmentTest1Fragment$ref,
|}>;
export type usePaginationFragmentTest1Fragment$data = usePaginationFragmentTest1Fragment;
export type usePaginationFragmentTest1Fragment$key = $ReadOnlyArray<{
  +$data?: usePaginationFragmentTest1Fragment$data,
  +$fragmentRefs: usePaginationFragmentTest1Fragment$ref,
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

module.exports = node;
