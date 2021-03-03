/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2f0da1aae3aed666a53afe7b84de47ba>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceTest1Fragment$ref: FragmentReference;
declare export opaque type FragmentResourceTest1Fragment$fragmentType: FragmentResourceTest1Fragment$ref;
export type FragmentResourceTest1Fragment = {|
  +id: string,
  +name: ?string,
  +$refType: FragmentResourceTest1Fragment$ref,
|};
export type FragmentResourceTest1Fragment$data = FragmentResourceTest1Fragment;
export type FragmentResourceTest1Fragment$key = {
  +$data?: FragmentResourceTest1Fragment$data,
  +$fragmentRefs: FragmentResourceTest1Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceTest1Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "f27c5d20e7bb39ee80a8008fdcbe9c3a";
}

module.exports = node;
