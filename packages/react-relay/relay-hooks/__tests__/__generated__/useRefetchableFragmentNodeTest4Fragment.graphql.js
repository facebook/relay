/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c44fa97d1ffeab4d784a149bfe203764>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest4Fragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeTest4Fragment$ref = useRefetchableFragmentNodeTest4Fragment$fragmentType;
export type useRefetchableFragmentNodeTest4Fragment$data = $ReadOnlyArray<{|
  +id: string,
  +$fragmentType: useRefetchableFragmentNodeTest4Fragment$fragmentType,
|}>;
export type useRefetchableFragmentNodeTest4Fragment = useRefetchableFragmentNodeTest4Fragment$data;
export type useRefetchableFragmentNodeTest4Fragment$key = $ReadOnlyArray<{
  +$data?: useRefetchableFragmentNodeTest4Fragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeTest4Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  useRefetchableFragmentNodeTest4Fragment$fragmentType,
  useRefetchableFragmentNodeTest4Fragment$data,
>*/);
