/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<06e080b62e90a68a9db928b9f02b67bb>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentFlowtest_users$fragmentType: FragmentType;
export type useFragmentFlowtest_users$data = ReadonlyArray<{
  readonly id: string,
  readonly $fragmentType: useFragmentFlowtest_users$fragmentType,
}>;
export type useFragmentFlowtest_users$key = ReadonlyArray<{
  readonly $data?: useFragmentFlowtest_users$data,
  readonly $fragmentSpreads: useFragmentFlowtest_users$fragmentType,
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
  (node/*:: as any*/).hash = "8b9b9b23494aec63a7cb96eed58ebcbc";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentFlowtest_users$fragmentType,
  useFragmentFlowtest_users$data,
>*/);
