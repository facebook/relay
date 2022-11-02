/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e4ad645944af756f5e146b7a9301ac56>>
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
export type QueryResourceTest6Fragment$data = {|
  +id: string,
  +username: ?string,
  +$fragmentType: QueryResourceTest6Fragment$fragmentType,
|};
export type QueryResourceTest6Fragment$key = {
  +$data?: QueryResourceTest6Fragment$data,
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
