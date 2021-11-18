/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<69866c83a5fd199b837fa5c1f595f27f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useRefetchableFragmentNodeTest5Fragment$fragmentType: FragmentType;
export type useRefetchableFragmentNodeTest5Fragment$ref = useRefetchableFragmentNodeTest5Fragment$fragmentType;
export type useRefetchableFragmentNodeTest5Fragment$data = {|
  +id: string,
  +$fragmentType: useRefetchableFragmentNodeTest5Fragment$fragmentType,
|};
export type useRefetchableFragmentNodeTest5Fragment = useRefetchableFragmentNodeTest5Fragment$data;
export type useRefetchableFragmentNodeTest5Fragment$key = {
  +$data?: useRefetchableFragmentNodeTest5Fragment$data,
  +$fragmentSpreads: useRefetchableFragmentNodeTest5Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  useRefetchableFragmentNodeTest5Fragment$fragmentType,
  useRefetchableFragmentNodeTest5Fragment$data,
>*/);
