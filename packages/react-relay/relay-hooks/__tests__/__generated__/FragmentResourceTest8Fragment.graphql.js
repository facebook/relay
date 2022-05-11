/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<55115cc0831080522108e3c01be3085d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest8Fragment$fragmentType: FragmentType;
export type FragmentResourceTest8Fragment$data = $ReadOnlyArray<{|
  +id: string,
  +$fragmentType: FragmentResourceTest8Fragment$fragmentType,
|}>;
export type FragmentResourceTest8Fragment$key = $ReadOnlyArray<{
  +$data?: FragmentResourceTest8Fragment$data,
  +$fragmentSpreads: FragmentResourceTest8Fragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "FragmentResourceTest8Fragment",
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
  (node/*: any*/).hash = "3659df213e80c235900fa14741c7dc8f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest8Fragment$fragmentType,
  FragmentResourceTest8Fragment$data,
>*/);
