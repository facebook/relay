/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c67a6879803b1d98e7aab8ac6b8c982a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitPayloadTest4UserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentCommitPayloadTest4UserFragment$fragmentType: RelayModernEnvironmentCommitPayloadTest4UserFragment$ref;
export type RelayModernEnvironmentCommitPayloadTest4UserFragment = {|
  +username: ?string,
  +$refType: RelayModernEnvironmentCommitPayloadTest4UserFragment$ref,
|};
export type RelayModernEnvironmentCommitPayloadTest4UserFragment$data = RelayModernEnvironmentCommitPayloadTest4UserFragment;
export type RelayModernEnvironmentCommitPayloadTest4UserFragment$key = {
  +$data?: RelayModernEnvironmentCommitPayloadTest4UserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentCommitPayloadTest4UserFragment$ref,
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

module.exports = node;
