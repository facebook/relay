/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0e51bd9e8c26a79eee9ce9c0507f5a0e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ExecTimeS2CResolvers_IdentityFragment$fragmentType: FragmentType;
export type ExecTimeS2CResolvers_IdentityFragment$data = {
  readonly id: string,
  readonly $fragmentType: ExecTimeS2CResolvers_IdentityFragment$fragmentType,
};
export type ExecTimeS2CResolvers_IdentityFragment$key = {
  readonly $data?: ExecTimeS2CResolvers_IdentityFragment$data,
  readonly $fragmentSpreads: ExecTimeS2CResolvers_IdentityFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ExecTimeS2CResolvers_IdentityFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "f658f5dc6c973af1bdcbf85d40d56267";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ExecTimeS2CResolvers_IdentityFragment$fragmentType,
  ExecTimeS2CResolvers_IdentityFragment$data,
>*/);
