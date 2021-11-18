/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9ae7246d02dc8879f02c4bd4144c953a>>
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
