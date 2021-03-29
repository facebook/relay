/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5072d8ca068b264a2817c64c8f781038>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitPayloadTest6UserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentCommitPayloadTest6UserFragment$fragmentType: RelayModernEnvironmentCommitPayloadTest6UserFragment$ref;
export type RelayModernEnvironmentCommitPayloadTest6UserFragment = {|
  +username: ?string,
  +$refType: RelayModernEnvironmentCommitPayloadTest6UserFragment$ref,
|};
export type RelayModernEnvironmentCommitPayloadTest6UserFragment$data = RelayModernEnvironmentCommitPayloadTest6UserFragment;
export type RelayModernEnvironmentCommitPayloadTest6UserFragment$key = {
  +$data?: RelayModernEnvironmentCommitPayloadTest6UserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentCommitPayloadTest6UserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentCommitPayloadTest6UserFragment",
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
  (node/*: any*/).hash = "c20e4517b435c60b8b2305e016dd86b0";
}

module.exports = node;
