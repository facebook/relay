/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cb2be8900bd25d278273b9e00ffa0419>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentCommitPayloadTest4UserFragment$data = {|
  +username: ?string,
  +$fragmentType: RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType,
|};
export type RelayModernEnvironmentCommitPayloadTest4UserFragment$key = {
  +$data?: RelayModernEnvironmentCommitPayloadTest4UserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentCommitPayloadTest4UserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9fe632b35b633d02accdbcdfdaec2ea4";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType,
  RelayModernEnvironmentCommitPayloadTest4UserFragment$data,
>*/);
