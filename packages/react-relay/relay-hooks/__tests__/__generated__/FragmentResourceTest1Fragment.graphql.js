/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6c905c269795a20cb07a0ec988dafcff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest1Fragment$fragmentType: FragmentType;
export type FragmentResourceTest1Fragment$ref = FragmentResourceTest1Fragment$fragmentType;
export type FragmentResourceTest1Fragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: FragmentResourceTest1Fragment$fragmentType,
|};
export type FragmentResourceTest1Fragment = FragmentResourceTest1Fragment$data;
export type FragmentResourceTest1Fragment$key = {
  +$data?: FragmentResourceTest1Fragment$data,
  +$fragmentSpreads: FragmentResourceTest1Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest1Fragment$fragmentType,
  FragmentResourceTest1Fragment$data,
>*/);
