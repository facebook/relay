/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e21003870360e15cc93c1cee7aa239ad>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentFlowtest_users$fragmentType: FragmentType;
export type useFragmentFlowtest_users$ref = useFragmentFlowtest_users$fragmentType;
export type useFragmentFlowtest_users$data = $ReadOnlyArray<{|
  +id: string,
  +$fragmentType: useFragmentFlowtest_users$fragmentType,
|}>;
export type useFragmentFlowtest_users = useFragmentFlowtest_users$data;
export type useFragmentFlowtest_users$key = $ReadOnlyArray<{
  +$data?: useFragmentFlowtest_users$data,
  +$fragmentSpreads: useFragmentFlowtest_users$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "useFragmentFlowtest_users",
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
  (node/*: any*/).hash = "8b9b9b23494aec63a7cb96eed58ebcbc";
}

module.exports = ((node/*: any*/)/*: Fragment<
  useFragmentFlowtest_users$fragmentType,
  useFragmentFlowtest_users$data,
>*/);
