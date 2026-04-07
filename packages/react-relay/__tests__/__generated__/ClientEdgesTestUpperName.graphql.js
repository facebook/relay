/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<aca889333a3e4fb8996ff4a580d13487>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type ClientEdgesTestUpperName$fragmentType: FragmentType;
export type ClientEdgesTestUpperName$data = {|
  +name: ?string,
  +$fragmentType: ClientEdgesTestUpperName$fragmentType,
|};
export type ClientEdgesTestUpperName$key = {
  +$data?: ClientEdgesTestUpperName$data,
  +$fragmentSpreads: ClientEdgesTestUpperName$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ClientEdgesTestUpperName",
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
  (node/*:: as any*/).hash = "be2c514c21045e5df5e947adccc4f146";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  ClientEdgesTestUpperName$fragmentType,
  ClientEdgesTestUpperName$data,
>*/);
