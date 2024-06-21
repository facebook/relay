/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<a5734f044ea47db34e39d30449cd5f03>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { AstrologicalSignSelfResolver$key } from "./AstrologicalSignSelfResolver.graphql";
import type { FragmentType } from "relay-runtime";
import {self as astrologicalSignSelfResolverType} from "../AstrologicalSignSelfResolver.js";
// Type assertion validating that `astrologicalSignSelfResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignSelfResolverType: (
  rootKey: AstrologicalSignSelfResolver$key,
) => mixed);
declare export opaque type AstrologicalSignHouseResolver$fragmentType: FragmentType;
export type AstrologicalSignHouseResolver$data = {|
  +self: ?$Call<<R>((...empty[]) => R) => R, typeof astrologicalSignSelfResolverType>,
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
      "resolverModule": require('./../AstrologicalSignSelfResolver').self,
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
