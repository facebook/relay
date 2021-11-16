/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6e98f282e3a91cfe06f6638b95b1417d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceTest6Fragment$fragmentType: FragmentType;
export type QueryResourceTest6Fragment$ref = QueryResourceTest6Fragment$fragmentType;
export type QueryResourceTest6Fragment$data = {|
  +id: string,
  +username: ?string,
  +$refType: QueryResourceTest6Fragment$fragmentType,
  +$fragmentType: QueryResourceTest6Fragment$fragmentType,
|};
export type QueryResourceTest6Fragment = QueryResourceTest6Fragment$data;
export type QueryResourceTest6Fragment$key = {
  +$data?: QueryResourceTest6Fragment$data,
  +$fragmentRefs: QueryResourceTest6Fragment$fragmentType,
  +$fragmentSpreads: QueryResourceTest6Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  QueryResourceTest6Fragment$fragmentType,
  QueryResourceTest6Fragment$data,
>*/);
