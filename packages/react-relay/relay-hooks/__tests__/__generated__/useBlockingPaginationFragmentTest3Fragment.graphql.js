/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<406b7f3e99f1e6326210a36a0de5ee9b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTest3Fragment$ref: FragmentReference;
declare export opaque type useBlockingPaginationFragmentTest3Fragment$fragmentType: useBlockingPaginationFragmentTest3Fragment$ref;
export type useBlockingPaginationFragmentTest3Fragment = {|
  +id: string,
  +$refType: useBlockingPaginationFragmentTest3Fragment$ref,
|};
export type useBlockingPaginationFragmentTest3Fragment$data = useBlockingPaginationFragmentTest3Fragment;
export type useBlockingPaginationFragmentTest3Fragment$key = {
  +$data?: useBlockingPaginationFragmentTest3Fragment$data,
  +$fragmentRefs: useBlockingPaginationFragmentTest3Fragment$ref,
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
  (node/*: any*/).hash = "7f61e10c85a362f8e5a7f814a4b92a5a";
}

module.exports = node;
