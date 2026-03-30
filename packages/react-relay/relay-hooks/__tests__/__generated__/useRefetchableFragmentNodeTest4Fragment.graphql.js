/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<91254dc12693902d7dde79d192452063>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest4Fragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeTest4Fragment$data = ReadonlyArray<{|
  +id: string,
  +$fragmentType: useRefetchableFragmentNodeTest4Fragment$fragmentType,
|}>;
export type useRefetchableFragmentNodeTest4Fragment$key = ReadonlyArray<{
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
  (node/*:: as any*/).hash = "aefb7faae26173c6c2f8bba8aedab15b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useRefetchableFragmentNodeTest4Fragment$fragmentType,
  useRefetchableFragmentNodeTest4Fragment$data,
>*/);
