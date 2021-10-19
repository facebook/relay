/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b19b0309b3a5de940e14f2465a3ec9c5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResolverTestUtilsTest$ref: FragmentReference;
declare export opaque type RelayResolverTestUtilsTest$fragmentType: RelayResolverTestUtilsTest$ref;
export type RelayResolverTestUtilsTest = {|
  +name: ?string,
  +$refType: RelayResolverTestUtilsTest$ref,
|};
export type RelayResolverTestUtilsTest$data = RelayResolverTestUtilsTest;
export type RelayResolverTestUtilsTest$key = {
  +$data?: RelayResolverTestUtilsTest$data,
  +$fragmentRefs: RelayResolverTestUtilsTest$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResolverTestUtilsTest",
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
  (node/*: any*/).hash = "3a0fa8882a80c216d6a96e8eabb1a8ab";
}

module.exports = node;
