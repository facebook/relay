/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1114e2f4ba648c649afdd5e4193bd433>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type QueryResourceTest2Fragment$fragmentType: FragmentType;
export type QueryResourceTest2Fragment$ref = QueryResourceTest2Fragment$fragmentType;
export type QueryResourceTest2Fragment$data = {|
  +id: string,
  +username: ?string,
  +$fragmentType: QueryResourceTest2Fragment$fragmentType,
|};
export type QueryResourceTest2Fragment = QueryResourceTest2Fragment$data;
export type QueryResourceTest2Fragment$key = {
  +$data?: QueryResourceTest2Fragment$data,
  +$fragmentSpreads: QueryResourceTest2Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  QueryResourceTest2Fragment$fragmentType,
  QueryResourceTest2Fragment$data,
>*/);
