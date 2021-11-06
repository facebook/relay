/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5839c1d1c2d756a74412f509e6b6191d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type QueryResourceTest2Fragment$ref: FragmentReference;
declare export opaque type QueryResourceTest2Fragment$fragmentType: QueryResourceTest2Fragment$ref;
export type QueryResourceTest2Fragment = {|
  +id: string,
  +username: ?string,
  +$refType: QueryResourceTest2Fragment$ref,
|};
export type QueryResourceTest2Fragment$data = QueryResourceTest2Fragment;
export type QueryResourceTest2Fragment$key = {
  +$data?: QueryResourceTest2Fragment$data,
  +$fragmentRefs: QueryResourceTest2Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest2Fragment",
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
      "name": "username",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "f0b113469b6ab4c600feb4bcc81799eb";
}

module.exports = node;
