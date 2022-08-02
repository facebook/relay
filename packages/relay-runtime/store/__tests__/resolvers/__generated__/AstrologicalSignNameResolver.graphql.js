/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<44f07d5e35238e9edf8925c49b37f17d>>
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
import astrologicalSignSelfResolver from "../AstrologicalSignSelfResolver.js";
// Type assertion validating that `astrologicalSignSelfResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignSelfResolver: (
  rootKey: AstrologicalSignSelfResolver$key, 
) => mixed);
declare export opaque type AstrologicalSignNameResolver$fragmentType: FragmentType;
export type AstrologicalSignNameResolver$data = {|
  +self: ?$Call<<R>((...empty[]) => R) => R, typeof astrologicalSignSelfResolver>,
  +$fragmentType: AstrologicalSignNameResolver$fragmentType,
|};
export type AstrologicalSignNameResolver$key = {
  +$data?: AstrologicalSignNameResolver$data,
  +$fragmentSpreads: AstrologicalSignNameResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AstrologicalSignNameResolver",
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
      "resolverModule": require('./../AstrologicalSignSelfResolver'),
      "path": "self"
    }
  ],
  "type": "AstrologicalSign",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "9ad858ddaec8b65cd26583a45087ea88";
}

module.exports = ((node/*: any*/)/*: Fragment<
  AstrologicalSignNameResolver$fragmentType,
  AstrologicalSignNameResolver$data,
>*/);
