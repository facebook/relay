/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<40adb48bdd018284aa040e00a1fdae20>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResolverTestUtilsTest$fragmentType: FragmentType;
export type RelayResolverTestUtilsTest$data = {|
  +name: ?string,
  +$fragmentType: RelayResolverTestUtilsTest$fragmentType,
|};
export type RelayResolverTestUtilsTest$key = {
  +$data?: RelayResolverTestUtilsTest$data,
  +$fragmentSpreads: RelayResolverTestUtilsTest$fragmentType,
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
  (node/*:: as any*/).hash = "3a0fa8882a80c216d6a96e8eabb1a8ab";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResolverTestUtilsTest$fragmentType,
  RelayResolverTestUtilsTest$data,
>*/);
