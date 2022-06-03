/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7988dbf858a72c33b41c9e9dd37fd8ed>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import userConstantResolver from "../UserConstantResolver.js";
declare export opaque type UserConstantDependentResolver$fragmentType: FragmentType;
export type UserConstantDependentResolver$data = {|
  +constant: ?$Call<<R>((...empty[]) => R) => R, typeof userConstantResolver>,
  +$fragmentType: UserConstantDependentResolver$fragmentType,
|};
export type UserConstantDependentResolver$key = {
  +$data?: UserConstantDependentResolver$data,
  +$fragmentSpreads: UserConstantDependentResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserConstantDependentResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "UserConstantResolver"
      },
      "kind": "RelayResolver",
      "name": "constant",
      "resolverModule": require('./../UserConstantResolver.js'),
      "path": "constant"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "24ebf834d1a139bc177fc287cdf0dfd2";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserConstantDependentResolver$fragmentType,
  UserConstantDependentResolver$data,
>*/);
