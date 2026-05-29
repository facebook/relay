/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d80c8bc19fb4c6ab96cf80e7f96c5d81>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTestNestedUserFragment$fragmentType: FragmentType;
export type usePaginationFragmentTestNestedUserFragment$data = {
  readonly username: ?string,
  readonly $fragmentType: usePaginationFragmentTestNestedUserFragment$fragmentType,
};
export type usePaginationFragmentTestNestedUserFragment$key = {
  readonly $data?: usePaginationFragmentTestNestedUserFragment$data,
  readonly $fragmentSpreads: usePaginationFragmentTestNestedUserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "d9264b58ca5ba023a29d467288406def";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  usePaginationFragmentTestNestedUserFragment$fragmentType,
  usePaginationFragmentTestNestedUserFragment$data,
>*/);
