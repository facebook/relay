/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d0dd42ead0db34aa015dec8a77b13c19>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceTest7Fragment$ref: FragmentReference;
declare export opaque type FragmentResourceTest7Fragment$fragmentType: FragmentResourceTest7Fragment$ref;
export type FragmentResourceTest7Fragment = $ReadOnlyArray<{|
  +id: string,
  +$refType: FragmentResourceTest7Fragment$ref,
|}>;
export type FragmentResourceTest7Fragment$data = FragmentResourceTest7Fragment;
export type FragmentResourceTest7Fragment$key = $ReadOnlyArray<{
  +$data?: FragmentResourceTest7Fragment$data,
  +$fragmentRefs: FragmentResourceTest7Fragment$ref,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "FragmentResourceTest7Fragment",
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
  (node/*: any*/).hash = "ebc4afb7252a93a2bd791e8df1d94136";
}

module.exports = node;
