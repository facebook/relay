/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<5ff59f71df9f3293c84e94e062676df7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$fragmentType: FragmentType;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$data = {|
  +lastName: ?string,
  +$fragmentType: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$fragmentType,
|};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$key = {
  +$data?: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$data,
  +$fragmentSpreads: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user",
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
  (node/*: any*/).hash = "3baa15f562e68de4ddc574ce6cd16ccc";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$fragmentType,
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$data,
>*/);
