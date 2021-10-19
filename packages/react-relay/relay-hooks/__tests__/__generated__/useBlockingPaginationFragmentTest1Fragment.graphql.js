/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9958e5f9cb06294916c1bd2480713028>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTest1Fragment$ref: FragmentReference;
declare export opaque type useBlockingPaginationFragmentTest1Fragment$fragmentType: useBlockingPaginationFragmentTest1Fragment$ref;
export type useBlockingPaginationFragmentTest1Fragment = $ReadOnlyArray<{|
  +id: string,
  +$refType: useBlockingPaginationFragmentTest1Fragment$ref,
|}>;
export type useBlockingPaginationFragmentTest1Fragment$data = useBlockingPaginationFragmentTest1Fragment;
export type useBlockingPaginationFragmentTest1Fragment$key = $ReadOnlyArray<{
  +$data?: useBlockingPaginationFragmentTest1Fragment$data,
  +$fragmentRefs: useBlockingPaginationFragmentTest1Fragment$ref,
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
  (node/*: any*/).hash = "ff8a7af82662cd77253e7908d8c64d41";
}

module.exports = node;
