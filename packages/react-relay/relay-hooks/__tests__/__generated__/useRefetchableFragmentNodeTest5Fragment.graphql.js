/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<49e93651fa1989ebd38c1d13f0e0a399>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest5Fragment$ref: FragmentReference;
declare export opaque type useRefetchableFragmentNodeTest5Fragment$fragmentType: useRefetchableFragmentNodeTest5Fragment$ref;
export type useRefetchableFragmentNodeTest5Fragment = {|
  +id: string,
  +$refType: useRefetchableFragmentNodeTest5Fragment$ref,
|};
export type useRefetchableFragmentNodeTest5Fragment$data = useRefetchableFragmentNodeTest5Fragment;
export type useRefetchableFragmentNodeTest5Fragment$key = {
  +$data?: useRefetchableFragmentNodeTest5Fragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeTest5Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useRefetchableFragmentNodeTest5Fragment",
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
  (node/*: any*/).hash = "a0f5fca4801759e021c4e094b70fe771";
}

module.exports = node;
