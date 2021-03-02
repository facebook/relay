/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d0c8616dfcdb7dab74f6263f7b57572a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type QueryResourceTest6Fragment$ref: FragmentReference;
declare export opaque type QueryResourceTest6Fragment$fragmentType: QueryResourceTest6Fragment$ref;
export type QueryResourceTest6Fragment = {|
  +id: string,
  +username: ?string,
  +$refType: QueryResourceTest6Fragment$ref,
|};
export type QueryResourceTest6Fragment$data = QueryResourceTest6Fragment;
export type QueryResourceTest6Fragment$key = {
  +$data?: QueryResourceTest6Fragment$data,
  +$fragmentRefs: QueryResourceTest6Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "QueryResourceTest6Fragment",
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
  (node/*: any*/).hash = "32748ac19d95e3410e42ccafd031dbc2";
}

module.exports = node;
