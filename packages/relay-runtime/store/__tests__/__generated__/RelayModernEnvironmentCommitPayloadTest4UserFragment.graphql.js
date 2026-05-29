/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<47646efaeaec83e24413551990ef2c49>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentCommitPayloadTest4UserFragment$data = {
  readonly username: ?string,
  readonly $fragmentType: RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType,
};
export type RelayModernEnvironmentCommitPayloadTest4UserFragment$key = {
  readonly $data?: RelayModernEnvironmentCommitPayloadTest4UserFragment$data,
  readonly $fragmentSpreads: RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType,
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
  (node/*:: as any*/).hash = "9fe632b35b633d02accdbcdfdaec2ea4";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType,
  RelayModernEnvironmentCommitPayloadTest4UserFragment$data,
>*/);
