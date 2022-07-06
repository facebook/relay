/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<46eb5b74f788ece3b774b4de513505cb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type UserAlwaysThrowsResolver$key = any;
import type { FragmentType } from "relay-runtime";
import userAlwaysThrowsResolver from "../UserAlwaysThrowsResolver.js";
// Type assertion validating that `userAlwaysThrowsResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAlwaysThrowsResolver: (
  rootKey: UserAlwaysThrowsResolver$key, 
) => mixed);
declare export opaque type UserAlwaysThrowsTransitivelyResolver$fragmentType: FragmentType;
export type UserAlwaysThrowsTransitivelyResolver$data = {|
  +always_throws: ?$Call<<R>((...empty[]) => R) => R, typeof userAlwaysThrowsResolver>,
  +$fragmentType: UserAlwaysThrowsTransitivelyResolver$fragmentType,
|};
export type UserAlwaysThrowsTransitivelyResolver$key = {
  +$data?: UserAlwaysThrowsTransitivelyResolver$data,
  +$fragmentSpreads: UserAlwaysThrowsTransitivelyResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserAlwaysThrowsTransitivelyResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "UserAlwaysThrowsResolver"
      },
      "kind": "RelayResolver",
      "name": "always_throws",
      "resolverModule": require('./../UserAlwaysThrowsResolver'),
      "path": "always_throws"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "46889babda2ee3ea422d710cb059c7e7";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserAlwaysThrowsTransitivelyResolver$fragmentType,
  UserAlwaysThrowsTransitivelyResolver$data,
>*/);
