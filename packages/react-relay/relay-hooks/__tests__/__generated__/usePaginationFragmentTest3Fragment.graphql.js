/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<225ef836455c69a81a74da18b67aaa8b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type usePaginationFragmentTest3Fragment$fragmentType: FragmentType;
export type usePaginationFragmentTest3Fragment$ref = usePaginationFragmentTest3Fragment$fragmentType;
type usePaginationFragmentTest3FragmentRefetchQuery$variables = any;
export type usePaginationFragmentTest3Fragment$data = {|
  +id: string,
  +$fragmentType: usePaginationFragmentTest3Fragment$fragmentType,
|};
export type usePaginationFragmentTest3Fragment = usePaginationFragmentTest3Fragment$data;
export type usePaginationFragmentTest3Fragment$key = {
  +$data?: usePaginationFragmentTest3Fragment$data,
  +$fragmentSpreads: usePaginationFragmentTest3Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "node"
      ],
      "operation": require('./usePaginationFragmentTest3FragmentRefetchQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "usePaginationFragmentTest3Fragment",
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
  (node/*: any*/).hash = "b7e65e1c3646e22d52de26d24bb8c2a9";
}

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  usePaginationFragmentTest3Fragment$fragmentType,
  usePaginationFragmentTest3Fragment$data,
  usePaginationFragmentTest3FragmentRefetchQuery$variables,
>*/);
