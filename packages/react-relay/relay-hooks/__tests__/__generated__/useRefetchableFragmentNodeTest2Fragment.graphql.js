/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<877e1d75bd76e4aa6b09f9981e1b1cf0>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest2Fragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeTest2Fragment$data = {
  readonly username: ?string,
  readonly $fragmentType: useRefetchableFragmentNodeTest2Fragment$fragmentType,
};
export type useRefetchableFragmentNodeTest2Fragment$key = {
  readonly $data?: useRefetchableFragmentNodeTest2Fragment$data,
  readonly $fragmentSpreads: useRefetchableFragmentNodeTest2Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useRefetchableFragmentNodeTest2Fragment",
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
  (node/*:: as any*/).hash = "0c2f5a8ab89a6105c3468ef1688ca32a";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useRefetchableFragmentNodeTest2Fragment$fragmentType,
  useRefetchableFragmentNodeTest2Fragment$data,
>*/);
