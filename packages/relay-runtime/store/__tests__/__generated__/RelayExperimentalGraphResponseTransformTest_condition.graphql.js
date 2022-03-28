/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bca9b2a305f964e1ec2cda390618b5ac>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayExperimentalGraphResponseTransformTest_condition$fragmentType: FragmentType;
export type RelayExperimentalGraphResponseTransformTest_condition$data = {|
  +name: ?string,
  +$fragmentType: RelayExperimentalGraphResponseTransformTest_condition$fragmentType,
|};
export type RelayExperimentalGraphResponseTransformTest_condition$key = {
  +$data?: RelayExperimentalGraphResponseTransformTest_condition$data,
  +$fragmentSpreads: RelayExperimentalGraphResponseTransformTest_condition$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayExperimentalGraphResponseTransformTest_condition",
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
  (node/*: any*/).hash = "0a6ec18ee80fb0caf454bf1d2fa621a6";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayExperimentalGraphResponseTransformTest_condition$fragmentType,
  RelayExperimentalGraphResponseTransformTest_condition$data,
>*/);
