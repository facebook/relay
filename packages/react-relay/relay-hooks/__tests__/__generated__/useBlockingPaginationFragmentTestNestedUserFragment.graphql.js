/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<809ab8d7183c93f3ad6f678980a98e34>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useBlockingPaginationFragmentTestNestedUserFragment$fragmentType: FragmentType;
export type useBlockingPaginationFragmentTestNestedUserFragment$data = {
  readonly username: ?string,
  readonly $fragmentType: useBlockingPaginationFragmentTestNestedUserFragment$fragmentType,
};
export type useBlockingPaginationFragmentTestNestedUserFragment$key = {
  readonly $data?: useBlockingPaginationFragmentTestNestedUserFragment$data,
  readonly $fragmentSpreads: useBlockingPaginationFragmentTestNestedUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useBlockingPaginationFragmentTestNestedUserFragment",
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
  (node/*:: as any*/).hash = "eb2765a66613b55829da5ea9c3c0627a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useBlockingPaginationFragmentTestNestedUserFragment$fragmentType,
  useBlockingPaginationFragmentTestNestedUserFragment$data,
>*/);
