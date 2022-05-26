/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<94c5ef2b06c245f80a81e20ffee18c1a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserAlwaysThrowsResolver$fragmentType: FragmentType;
export type UserAlwaysThrowsResolver$data = {|
  +__typename: "User",
  +$fragmentType: UserAlwaysThrowsResolver$fragmentType,
|} | {|
  // This will never be '%other', but we need some
  // value in case none of the concrete values match.
  +__typename: "%other",
  +$fragmentType: UserAlwaysThrowsResolver$fragmentType,
|};
export type UserAlwaysThrowsResolver$key = {
  +$data?: UserAlwaysThrowsResolver$data,
  +$fragmentSpreads: UserAlwaysThrowsResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserAlwaysThrowsResolver",
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
  (node/*: any*/).hash = "411aa1f520986964330e8759a73ac6b1";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserAlwaysThrowsResolver$fragmentType,
  UserAlwaysThrowsResolver$data,
>*/);
