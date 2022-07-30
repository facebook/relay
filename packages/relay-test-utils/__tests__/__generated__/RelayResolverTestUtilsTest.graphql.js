/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4f90d212142f1213790fb261cb8fd90a>>
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
  (node/*: any*/).hash = "3a0fa8882a80c216d6a96e8eabb1a8ab";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResolverTestUtilsTest$fragmentType,
  RelayResolverTestUtilsTest$data,
>*/);
