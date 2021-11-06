/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d0f75a691c0dde2bc27eb2b317470545>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest2Fragment$ref: FragmentReference;
declare export opaque type useRefetchableFragmentNodeTest2Fragment$fragmentType: useRefetchableFragmentNodeTest2Fragment$ref;
export type useRefetchableFragmentNodeTest2Fragment = {|
  +username: ?string,
  +$refType: useRefetchableFragmentNodeTest2Fragment$ref,
|};
export type useRefetchableFragmentNodeTest2Fragment$data = useRefetchableFragmentNodeTest2Fragment;
export type useRefetchableFragmentNodeTest2Fragment$key = {
  +$data?: useRefetchableFragmentNodeTest2Fragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeTest2Fragment$ref,
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

module.exports = node;
