/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<91c3e021a589ac55c31e92d111a59717>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayExperimentalGraphResponseTransformTest_user_name$fragmentType: FragmentType;
export type RelayExperimentalGraphResponseTransformTest_user_name$data = {|
  +name: ?string,
  +$fragmentType: RelayExperimentalGraphResponseTransformTest_user_name$fragmentType,
|};
export type RelayExperimentalGraphResponseTransformTest_user_name$key = {
  +$data?: RelayExperimentalGraphResponseTransformTest_user_name$data,
  +$fragmentSpreads: RelayExperimentalGraphResponseTransformTest_user_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayExperimentalGraphResponseTransformTest_user_name",
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
  (node/*: any*/).hash = "857d775ebedc1333f860824ab4508bee";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayExperimentalGraphResponseTransformTest_user_name$fragmentType,
  RelayExperimentalGraphResponseTransformTest_user_name$data,
>*/);
