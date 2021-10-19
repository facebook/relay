/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b8ce8b1134f52020891759e89a70af64>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type FragmentResourceTest2Fragment$ref: FragmentReference;
declare export opaque type FragmentResourceTest2Fragment$fragmentType: FragmentResourceTest2Fragment$ref;
export type FragmentResourceTest2Fragment = {|
  +id: string,
  +name: ?string,
  +username: ?string,
  +$refType: FragmentResourceTest2Fragment$ref,
|};
export type FragmentResourceTest2Fragment$data = FragmentResourceTest2Fragment;
export type FragmentResourceTest2Fragment$key = {
  +$data?: FragmentResourceTest2Fragment$data,
  +$fragmentRefs: FragmentResourceTest2Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceTest2Fragment",
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
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "c6e4e62b113bb7d6ad3334593782d9e2";
}

module.exports = node;
