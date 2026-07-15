/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c52498808e41f3cf85177a78deaadf55>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$data = {
  readonly username: ?string,
  readonly $fragmentType: useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType,
};
export type useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$key = {
  readonly $data?: useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$data,
  readonly $fragmentSpreads: useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "49b55a3f4bd3655c6481d29bc93aa9d1";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$fragmentType,
  useBlockingPaginationFragmentWithSuspenseTransitionTestNestedUserFragment$data,
>*/);
