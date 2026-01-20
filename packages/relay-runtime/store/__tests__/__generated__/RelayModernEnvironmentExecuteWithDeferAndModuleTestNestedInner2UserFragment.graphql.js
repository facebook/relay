/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1224bc9882f8bdc2a7678dc7d8096cdc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$data = {|
  +lastName: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType,
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
  (node/*: any*/).hash = "250fcb30498857f0c3b233255aa0e57b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferAndModuleTestNestedInner2UserFragment$data,
>*/);
