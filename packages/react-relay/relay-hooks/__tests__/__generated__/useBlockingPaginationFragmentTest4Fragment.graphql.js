/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e041ddef0275e053ac88476a3c52d032>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
type useBlockingPaginationFragmentTest4Fragment$ref = any;
type useBlockingPaginationFragmentTest4Fragment$fragmentType = any;
export type { useBlockingPaginationFragmentTest4Fragment$ref, useBlockingPaginationFragmentTest4Fragment$fragmentType };
export type useBlockingPaginationFragmentTest4Fragment = {|
  +id: string,
  +$refType: useBlockingPaginationFragmentTest4Fragment$ref,
|};
export type useBlockingPaginationFragmentTest4Fragment$data = useBlockingPaginationFragmentTest4Fragment;
export type useBlockingPaginationFragmentTest4Fragment$key = {
  +$data?: useBlockingPaginationFragmentTest4Fragment$data,
  +$fragmentRefs: useBlockingPaginationFragmentTest4Fragment$ref,
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
      "operation": require('./useBlockingPaginationFragmentTest4FragmentRefetchQuery.graphql'),
      "identifierField": "id"
    }
  },
  "name": "useBlockingPaginationFragmentTest4Fragment",
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
  (node/*: any*/).hash = "43246af9f06d0dfe5df218b7d05f131c";
}

module.exports = node;
