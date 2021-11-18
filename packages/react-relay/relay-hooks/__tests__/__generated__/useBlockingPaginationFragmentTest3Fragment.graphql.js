/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7071e8255bcfb9de0a30af99778db501>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTest3Fragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentTest3Fragment$ref = useBlockingPaginationFragmentTest3Fragment$fragmentType;
export type useBlockingPaginationFragmentTest3Fragment$data = {|
  +id: string,
  +$fragmentType: useBlockingPaginationFragmentTest3Fragment$fragmentType,
|};
export type useBlockingPaginationFragmentTest3Fragment = useBlockingPaginationFragmentTest3Fragment$data;
export type useBlockingPaginationFragmentTest3Fragment$key = {
  +$data?: useBlockingPaginationFragmentTest3Fragment$data,
  +$fragmentSpreads: useBlockingPaginationFragmentTest3Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  useBlockingPaginationFragmentTest3Fragment$fragmentType,
  useBlockingPaginationFragmentTest3Fragment$data,
>*/);
