/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<824983b3f1afdebec9daaa5b10fdd80e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernFlowtest_user$fragmentType: FragmentType;
export type RelayModernFlowtest_user$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayModernFlowtest_user$fragmentType,
};
export type RelayModernFlowtest_user$key = {
  readonly $data?: RelayModernFlowtest_user$data,
  readonly $fragmentSpreads: RelayModernFlowtest_user$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernFlowtest_user",
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
  (node/*:: as any*/).hash = "18a730295ff54e88446f4f000f5fef7e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernFlowtest_user$fragmentType,
  RelayModernFlowtest_user$data,
>*/);
