/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c3c9238d59206143f43c2c7d2627ea67>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type QueryResourceTest5Fragment$ref: FragmentReference;
declare export opaque type QueryResourceTest5Fragment$fragmentType: QueryResourceTest5Fragment$ref;
export type QueryResourceTest5Fragment = {|
  +id: string,
  +username: ?string,
  +$refType: QueryResourceTest5Fragment$ref,
|};
export type QueryResourceTest5Fragment$data = QueryResourceTest5Fragment;
export type QueryResourceTest5Fragment$key = {
  +$data?: QueryResourceTest5Fragment$data,
  +$fragmentRefs: QueryResourceTest5Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest5Fragment",
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
  (node/*: any*/).hash = "878f2c61705495c7c0bac374b56c49fb";
}

module.exports = node;
