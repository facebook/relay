/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f36efe6f774e0311f0b7e4b1b3606f73>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest2Fragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeTest2Fragment$data = {|
  +username: ?string,
  +$fragmentType: useRefetchableFragmentNodeTest2Fragment$fragmentType,
|};
export type useRefetchableFragmentNodeTest2Fragment$key = {
  +$data?: useRefetchableFragmentNodeTest2Fragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeTest2Fragment$fragmentType,
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
  (node/*: any*/).hash = "0c2f5a8ab89a6105c3468ef1688ca32a";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useRefetchableFragmentNodeTest2Fragment$fragmentType,
  useRefetchableFragmentNodeTest2Fragment$data,
>*/);
