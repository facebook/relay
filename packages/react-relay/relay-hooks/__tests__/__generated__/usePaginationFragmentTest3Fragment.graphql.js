/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<860c2c3962d68cbed37c9a46f40ace5e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
type usePaginationFragmentTest3Fragment$ref = any;
type usePaginationFragmentTest3Fragment$fragmentType = any;
export type { usePaginationFragmentTest3Fragment$ref, usePaginationFragmentTest3Fragment$fragmentType };
export type usePaginationFragmentTest3Fragment = {|
  +id: string,
  +$refType: usePaginationFragmentTest3Fragment$ref,
|};
export type usePaginationFragmentTest3Fragment$data = usePaginationFragmentTest3Fragment;
export type usePaginationFragmentTest3Fragment$key = {
  +$data?: usePaginationFragmentTest3Fragment$data,
  +$fragmentRefs: usePaginationFragmentTest3Fragment$ref,
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

module.exports = node;
