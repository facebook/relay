/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6c90731e086dd159a04d64b67e5f60d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayStoreUtilsTest2Fragment$ref: FragmentReference;
declare export opaque type RelayStoreUtilsTest2Fragment$fragmentType: RelayStoreUtilsTest2Fragment$ref;
export type RelayStoreUtilsTest2Fragment = {|
  +name: ?string,
  +$refType: RelayStoreUtilsTest2Fragment$ref,
|};
export type RelayStoreUtilsTest2Fragment$data = RelayStoreUtilsTest2Fragment;
export type RelayStoreUtilsTest2Fragment$key = {
  +$data?: RelayStoreUtilsTest2Fragment$data,
  +$fragmentRefs: RelayStoreUtilsTest2Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayStoreUtilsTest2Fragment",
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
  (node/*: any*/).hash = "0651864d5b12926d4a8350efac4ebd53";
}

module.exports = node;
