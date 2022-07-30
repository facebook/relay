/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<455237df997a54a48cf4c31ce89ab009>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type FragmentResourceTest2Fragment$fragmentType: FragmentType;
export type FragmentResourceTest2Fragment$data = {|
  +id: string,
  +name: ?string,
  +username: ?string,
  +$fragmentType: FragmentResourceTest2Fragment$fragmentType,
|};
export type FragmentResourceTest2Fragment$key = {
  +$data?: FragmentResourceTest2Fragment$data,
  +$fragmentSpreads: FragmentResourceTest2Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceTest2Fragment$fragmentType,
  FragmentResourceTest2Fragment$data,
>*/);
