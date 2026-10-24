/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b0125c86c63d63f31957635b1dc81ea7>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerExecTimeS2CTestDeferredNameFragment$fragmentType: FragmentType;
export type DataCheckerExecTimeS2CTestDeferredNameFragment$data = {
  readonly name: ?string,
  readonly $fragmentType: DataCheckerExecTimeS2CTestDeferredNameFragment$fragmentType,
};
export type DataCheckerExecTimeS2CTestDeferredNameFragment$key = {
  readonly $data?: DataCheckerExecTimeS2CTestDeferredNameFragment$data,
  readonly $fragmentSpreads: DataCheckerExecTimeS2CTestDeferredNameFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerExecTimeS2CTestDeferredNameFragment",
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
  (node/*:: as any*/).hash = "c47f2d2bade6a93da2accd6cce7b1ffc";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerExecTimeS2CTestDeferredNameFragment$fragmentType,
  DataCheckerExecTimeS2CTestDeferredNameFragment$data,
>*/);
