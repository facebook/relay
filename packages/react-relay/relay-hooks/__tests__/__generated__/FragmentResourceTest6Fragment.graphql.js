/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<91eb5f84f6f3f6484c22c5e8acce804a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest6Fragment$fragmentType: FragmentType;
export type FragmentResourceTest6Fragment$data = {|
  +id: string,
  +name: ?string,
  +$fragmentType: FragmentResourceTest6Fragment$fragmentType,
|};
export type FragmentResourceTest6Fragment$key = {
  +$data?: FragmentResourceTest6Fragment$data,
  +$fragmentSpreads: FragmentResourceTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceTest6Fragment",
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
  (node/*: any*/).hash = "26deeac9ed39ae31bf668919ae1ed5ad";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest6Fragment$fragmentType,
  FragmentResourceTest6Fragment$data,
>*/);
