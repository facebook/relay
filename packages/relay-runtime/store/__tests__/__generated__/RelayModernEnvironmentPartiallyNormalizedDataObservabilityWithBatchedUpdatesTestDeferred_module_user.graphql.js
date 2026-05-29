/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<75bd0373412186a9dcd754f4f0f8a0d7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$fragmentType: FragmentType;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$data = {
  readonly lastName: ?string,
  readonly $fragmentType: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$fragmentType,
};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$key = {
  readonly $data?: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$data,
  readonly $fragmentSpreads: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user",
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
  (node/*:: as any*/).hash = "5daf4fbab924db1a9679c615514afd7d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$fragmentType,
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$data,
>*/);
