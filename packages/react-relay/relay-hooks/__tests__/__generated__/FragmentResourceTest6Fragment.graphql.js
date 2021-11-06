/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f1f880aa116bc72bf09b1f4e002ff887>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceTest6Fragment$ref: FragmentReference;
declare export opaque type FragmentResourceTest6Fragment$fragmentType: FragmentResourceTest6Fragment$ref;
export type FragmentResourceTest6Fragment = {|
  +id: string,
  +name: ?string,
  +$refType: FragmentResourceTest6Fragment$ref,
|};
export type FragmentResourceTest6Fragment$data = FragmentResourceTest6Fragment;
export type FragmentResourceTest6Fragment$key = {
  +$data?: FragmentResourceTest6Fragment$data,
  +$fragmentRefs: FragmentResourceTest6Fragment$ref,
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

module.exports = node;
