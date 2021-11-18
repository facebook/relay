/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d8716cf9bc7c0b2784150cc9d9b462c8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTest4Fragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentTest4Fragment$ref = useBlockingPaginationFragmentTest4Fragment$fragmentType;
type useBlockingPaginationFragmentTest4FragmentRefetchQuery$variables = any;
export type useBlockingPaginationFragmentTest4Fragment$data = {|
  +id: string,
  +$fragmentType: useBlockingPaginationFragmentTest4Fragment$fragmentType,
|};
export type useBlockingPaginationFragmentTest4Fragment = useBlockingPaginationFragmentTest4Fragment$data;
export type useBlockingPaginationFragmentTest4Fragment$key = {
  +$data?: useBlockingPaginationFragmentTest4Fragment$data,
  +$fragmentSpreads: useBlockingPaginationFragmentTest4Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: RefetchableFragment<
  useBlockingPaginationFragmentTest4Fragment$fragmentType,
  useBlockingPaginationFragmentTest4Fragment$data,
  useBlockingPaginationFragmentTest4FragmentRefetchQuery$variables,
>*/);
