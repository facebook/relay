/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<792c1f65348f1586564042c75ab578ff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentCommitPayloadTest6UserFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentCommitPayloadTest6UserFragment$data = {|
  +username: ?string,
  +$fragmentType: RelayModernEnvironmentCommitPayloadTest6UserFragment$fragmentType,
|};
export type RelayModernEnvironmentCommitPayloadTest6UserFragment$key = {
  +$data?: RelayModernEnvironmentCommitPayloadTest6UserFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentCommitPayloadTest6UserFragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentCommitPayloadTest6UserFragment$fragmentType,
  RelayModernEnvironmentCommitPayloadTest6UserFragment$data,
>*/);
