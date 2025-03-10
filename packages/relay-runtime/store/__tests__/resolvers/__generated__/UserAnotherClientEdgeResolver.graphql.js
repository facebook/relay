/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9b561042e59b39b66fc334d8324c0d70>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserAnotherClientEdgeResolver$fragmentType: FragmentType;
export type UserAnotherClientEdgeResolver$data = {|
  +__typename: "User",
  +$fragmentType: UserAnotherClientEdgeResolver$fragmentType,
|};
export type UserAnotherClientEdgeResolver$key = {
  +$data?: UserAnotherClientEdgeResolver$data,
  +$fragmentSpreads: UserAnotherClientEdgeResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserAnotherClientEdgeResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__typename",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "0dbcb488a814dce8061bd8417e344beb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserAnotherClientEdgeResolver$fragmentType,
  UserAnotherClientEdgeResolver$data,
>*/);
