/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<03c66f9ac5ad20edf44182afcd572832>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$fragmentType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$ref;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user = {|
  +$fragmentRefs: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUserFragment$ref,
  +$refType: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$ref,
|};
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data = RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user;
export type RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$key = {
  +$data?: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$data,
  +$fragmentRefs: RelayModernEnvironmentExecuteWithDeferWithinModuleTestUser_user$ref,
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
  (node/*: any*/).hash = "04d25ce78bcd07804cf0d4b5d3114cf0";
}

module.exports = node;
