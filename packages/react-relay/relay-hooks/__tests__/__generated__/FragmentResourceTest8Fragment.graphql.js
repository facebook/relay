/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0c0eab395bcfd68ba4cadb05cc1d11b5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceTest8Fragment$ref: FragmentReference;
declare export opaque type FragmentResourceTest8Fragment$fragmentType: FragmentResourceTest8Fragment$ref;
export type FragmentResourceTest8Fragment = $ReadOnlyArray<{|
  +id: string,
  +$refType: FragmentResourceTest8Fragment$ref,
|}>;
export type FragmentResourceTest8Fragment$data = FragmentResourceTest8Fragment;
export type FragmentResourceTest8Fragment$key = $ReadOnlyArray<{
  +$data?: FragmentResourceTest8Fragment$data,
  +$fragmentRefs: FragmentResourceTest8Fragment$ref,
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

module.exports = node;
