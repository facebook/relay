/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<cfd477e8c6e5e719da5f927d15da3585>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerExecTimeS2CTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type DataCheckerExecTimeS2CTestPlainUserNameRenderer_name$data = {
  readonly plaintext: ?string,
  readonly $fragmentType: DataCheckerExecTimeS2CTestPlainUserNameRenderer_name$fragmentType,
};
export type DataCheckerExecTimeS2CTestPlainUserNameRenderer_name$key = {
  readonly $data?: DataCheckerExecTimeS2CTestPlainUserNameRenderer_name$data,
  readonly $fragmentSpreads: DataCheckerExecTimeS2CTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerExecTimeS2CTestPlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "a03a1910a5b4f20a06b338b794ea9432";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerExecTimeS2CTestPlainUserNameRenderer_name$fragmentType,
  DataCheckerExecTimeS2CTestPlainUserNameRenderer_name$data,
>*/);
