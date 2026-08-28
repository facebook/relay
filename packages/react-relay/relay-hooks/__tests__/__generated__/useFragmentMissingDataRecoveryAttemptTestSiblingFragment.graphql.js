/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6f989d6ce2397dbd52157631e2574bf8>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentMissingDataRecoveryAttemptTestSiblingFragment$fragmentType: FragmentType;
export type useFragmentMissingDataRecoveryAttemptTestSiblingFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: useFragmentMissingDataRecoveryAttemptTestSiblingFragment$fragmentType,
};
export type useFragmentMissingDataRecoveryAttemptTestSiblingFragment$key = {
  readonly $data?: useFragmentMissingDataRecoveryAttemptTestSiblingFragment$data,
  readonly $fragmentSpreads: useFragmentMissingDataRecoveryAttemptTestSiblingFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentMissingDataRecoveryAttemptTestSiblingFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "ce708b8f37d405c45ce15a0ab81e8bd4";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentMissingDataRecoveryAttemptTestSiblingFragment$fragmentType,
  useFragmentMissingDataRecoveryAttemptTestSiblingFragment$data,
>*/);
