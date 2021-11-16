/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e1bc00baf42cc333b3bb00f6d1ad589b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTestNestedUserFragment$fragmentType: FragmentType;
export type usePaginationFragmentTestNestedUserFragment$ref = usePaginationFragmentTestNestedUserFragment$fragmentType;
export type usePaginationFragmentTestNestedUserFragment$data = {|
  +username: ?string,
  +$refType: usePaginationFragmentTestNestedUserFragment$fragmentType,
  +$fragmentType: usePaginationFragmentTestNestedUserFragment$fragmentType,
|};
export type usePaginationFragmentTestNestedUserFragment = usePaginationFragmentTestNestedUserFragment$data;
export type usePaginationFragmentTestNestedUserFragment$key = {
  +$data?: usePaginationFragmentTestNestedUserFragment$data,
  +$fragmentRefs: usePaginationFragmentTestNestedUserFragment$fragmentType,
  +$fragmentSpreads: usePaginationFragmentTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "usePaginationFragmentTestNestedUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d9264b58ca5ba023a29d467288406def";
}

module.exports = ((node/*: any*/)/*: Fragment<
  usePaginationFragmentTestNestedUserFragment$fragmentType,
  usePaginationFragmentTestNestedUserFragment$data,
>*/);
