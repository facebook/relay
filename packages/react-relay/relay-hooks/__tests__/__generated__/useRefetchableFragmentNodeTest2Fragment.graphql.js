/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d60dd5f51e45dc428be37909e878f2e5>>
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
export type useRefetchableFragmentNodeTest2Fragment$ref = useRefetchableFragmentNodeTest2Fragment$fragmentType;
export type useRefetchableFragmentNodeTest2Fragment$data = {|
  +username: ?string,
  +$fragmentType: useRefetchableFragmentNodeTest2Fragment$fragmentType,
|};
export type useRefetchableFragmentNodeTest2Fragment = useRefetchableFragmentNodeTest2Fragment$data;
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
