/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e1e3c067dec47ba9d091c6f1966be184>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$data = {|
  +lastName: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment",
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
  (node/*: any*/).hash = "701e0240757ebe2212402e86773bdfeb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$fragmentType,
  RelayModernEnvironmentExecuteWithDeferTestNestedInnerInner2UserFragment$data,
>*/);
