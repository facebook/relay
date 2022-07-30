/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6b0fa8e377e08f194d16c652eb6c3c17>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayExperimentalGraphResponseTransformTest_no_inline_user_name$fragmentType: FragmentType;
export type RelayExperimentalGraphResponseTransformTest_no_inline_user_name$data = {|
  +name: ?string,
  +$fragmentType: RelayExperimentalGraphResponseTransformTest_no_inline_user_name$fragmentType,
|};
export type RelayExperimentalGraphResponseTransformTest_no_inline_user_name$key = {
  +$data?: RelayExperimentalGraphResponseTransformTest_no_inline_user_name$data,
  +$fragmentSpreads: RelayExperimentalGraphResponseTransformTest_no_inline_user_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayExperimentalGraphResponseTransformTest_no_inline_user_name",
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
  (node/*: any*/).hash = "91394abbe5b69867a91202783e70a2a3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayExperimentalGraphResponseTransformTest_no_inline_user_name$fragmentType,
  RelayExperimentalGraphResponseTransformTest_no_inline_user_name$data,
>*/);
