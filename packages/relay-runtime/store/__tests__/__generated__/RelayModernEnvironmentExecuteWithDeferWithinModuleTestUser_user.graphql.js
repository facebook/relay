/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d0286dcf61f3cb36dac4b227b19f8834>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType } from "./RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment.graphql";
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data = {
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$fragmentType,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user",
  "selections": [
    {
      "kind": "Defer",
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "04d25ce78bcd07804cf0d4b5d3114cf0";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType,
  RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data,
>*/);
