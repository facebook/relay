/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2f7cd886d0d0031d821a517e127ab422>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentBatchUpdatesTestFragment$fragmentType: FragmentType;
export type RelayModernEnvironmentBatchUpdatesTestFragment$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentBatchUpdatesTestFragment$fragmentType,
|};
export type RelayModernEnvironmentBatchUpdatesTestFragment$key = {
  +$data?: RelayModernEnvironmentBatchUpdatesTestFragment$data,
  +$fragmentSpreads: RelayModernEnvironmentBatchUpdatesTestFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentBatchUpdatesTestFragment",
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
  (node/*:: as any*/).hash = "7816f9f3c76db3f79723d69cd9285185";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentBatchUpdatesTestFragment$fragmentType,
  RelayModernEnvironmentBatchUpdatesTestFragment$data,
>*/);
