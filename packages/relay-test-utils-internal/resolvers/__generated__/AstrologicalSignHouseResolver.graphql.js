/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5b48110aa623eaab31a23fcf98eee6e0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import astrologicalSignSelfResolver from "../AstrologicalSignSelfResolver.js";
declare export opaque type AstrologicalSignHouseResolver$fragmentType: FragmentType;
export type AstrologicalSignHouseResolver$data = {|
  +self: ?$Call<<R>((...empty[]) => R) => R, typeof astrologicalSignSelfResolver>,
  +$fragmentType: AstrologicalSignHouseResolver$fragmentType,
|};
export type AstrologicalSignHouseResolver$key = {
  +$data?: AstrologicalSignHouseResolver$data,
  +$fragmentSpreads: AstrologicalSignHouseResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AstrologicalSignHouseResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "AstrologicalSignSelfResolver"
      },
      "kind": "RelayResolver",
      "name": "self",
      "resolverModule": require('./../AstrologicalSignSelfResolver.js'),
      "path": "self"
    }
  ],
  "type": "AstrologicalSign",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "96406c4a0fd65a85140fef0d15d7412f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  AstrologicalSignHouseResolver$fragmentType,
  AstrologicalSignHouseResolver$data,
>*/);
