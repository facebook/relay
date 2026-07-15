/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1d9f63ae3d534bacab70acd20883e67b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$data = {
  readonly lastName: ?string,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "lastName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "250fcb30498857f0c3b233255aa0e57b";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$data,
>*/);
