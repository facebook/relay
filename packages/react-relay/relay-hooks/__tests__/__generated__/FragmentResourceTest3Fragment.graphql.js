/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<80816644e55071bf77ec2c97198f738c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceTest3Fragment$ref: FragmentReference;
declare export opaque type FragmentResourceTest3Fragment$fragmentType: FragmentResourceTest3Fragment$ref;
export type FragmentResourceTest3Fragment = $ReadOnlyArray<{|
  +id: string,
  +name: ?string,
  +$refType: FragmentResourceTest3Fragment$ref,
|}>;
export type FragmentResourceTest3Fragment$data = FragmentResourceTest3Fragment;
export type FragmentResourceTest3Fragment$key = $ReadOnlyArray<{
  +$data?: FragmentResourceTest3Fragment$data,
  +$fragmentRefs: FragmentResourceTest3Fragment$ref,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true
  },
  "name": "FragmentResourceTest3Fragment",
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
  (node/*: any*/).hash = "2e6d446b0d37a086b0c6598bcbc72ccf";
}

module.exports = node;
