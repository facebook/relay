/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3f9b14e1c82f19035910b5e2d2c71d0d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$ref = useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType;
export type useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$data = {|
  +username: ?string,
  +$fragmentType: useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType,
|};
export type useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment = useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$data;
export type useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$key = {
  +$data?: useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$data,
  +$fragmentSpreads: useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment",
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
  (node/*: any*/).hash = "49b55a3f4bd3655c6481d29bc93aa9d1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType,
  useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$data,
>*/);
