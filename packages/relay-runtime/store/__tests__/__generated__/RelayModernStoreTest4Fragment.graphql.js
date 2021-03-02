/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<155f1a6fd2c9a329c654c6ed3be54090>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernStoreTest4Fragment$ref: FragmentReference;
declare export opaque type RelayModernStoreTest4Fragment$fragmentType: RelayModernStoreTest4Fragment$ref;
export type RelayModernStoreTest4Fragment = {|
  +username: ?string,
  +$refType: RelayModernStoreTest4Fragment$ref,
|};
export type RelayModernStoreTest4Fragment$data = RelayModernStoreTest4Fragment;
export type RelayModernStoreTest4Fragment$key = {
  +$data?: RelayModernStoreTest4Fragment$data,
  +$fragmentRefs: RelayModernStoreTest4Fragment$ref,
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

module.exports = node;
