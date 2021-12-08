/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<352f3e2ebc8f00d3ef69826984e485e8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreTest4Fragment$fragmentType: FragmentType;
export type RelayModernStoreTest4Fragment$ref = RelayModernStoreTest4Fragment$fragmentType;
export type RelayModernStoreTest4Fragment$data = {|
  +username: ?string,
  +$fragmentType: RelayModernStoreTest4Fragment$fragmentType,
|};
export type RelayModernStoreTest4Fragment = RelayModernStoreTest4Fragment$data;
export type RelayModernStoreTest4Fragment$key = {
  +$data?: RelayModernStoreTest4Fragment$data,
  +$fragmentSpreads: RelayModernStoreTest4Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernStoreTest4Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5ef882aa3b46447858182fa2dcb0f05f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernStoreTest4Fragment$fragmentType,
  RelayModernStoreTest4Fragment$data,
>*/);
