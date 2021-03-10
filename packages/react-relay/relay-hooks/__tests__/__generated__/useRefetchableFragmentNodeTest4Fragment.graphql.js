/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<cf9453953abf75f4180e8ff958044358>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest4Fragment$ref: FragmentReference;
declare export opaque type useRefetchableFragmentNodeTest4Fragment$fragmentType: useRefetchableFragmentNodeTest4Fragment$ref;
export type useRefetchableFragmentNodeTest4Fragment = $ReadOnlyArray<{|
  +id: string,
  +$refType: useRefetchableFragmentNodeTest4Fragment$ref,
|}>;
export type useRefetchableFragmentNodeTest4Fragment$data = useRefetchableFragmentNodeTest4Fragment;
export type useRefetchableFragmentNodeTest4Fragment$key = $ReadOnlyArray<{
  +$data?: useRefetchableFragmentNodeTest4Fragment$data,
  +$fragmentRefs: useRefetchableFragmentNodeTest4Fragment$ref,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "useRefetchableFragmentNodeTest4Fragment",
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
  (node/*: any*/).hash = "aefb7faae26173c6c2f8bba8aedab15b";
}

module.exports = node;
