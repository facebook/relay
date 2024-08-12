/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0498f6fde5a379d599583a9a96913d81>>
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
import type { TestLiveResolverContextType } from "../../../../mutations/__tests__/TestLiveResolverContextType";
// Type assertion validating that `astrologicalSignSelfResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignSelfResolverType: (
  rootKey: AstrologicalSignSelfResolver$key,
  args: void,
  context: TestLiveResolverContextType,
) => ?mixed);
declare export opaque type AstrologicalSignOppositeResolver$fragmentType: FragmentType;
export type AstrologicalSignOppositeResolver$data = {|
  +self: ?ReturnType<typeof astrologicalSignSelfResolverType>,
  +$fragmentType: AstrologicalSignOppositeResolver$fragmentType,
|};
export type AstrologicalSignOppositeResolver$key = {
  +$data?: AstrologicalSignOppositeResolver$data,
  +$fragmentSpreads: AstrologicalSignOppositeResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "AstrologicalSignOppositeResolver",
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
  (node/*: any*/).hash = "af597379ec145e8c2cb304b0e30821fb";
}

module.exports = ((node/*: any*/)/*: Fragment<
  AstrologicalSignOppositeResolver$fragmentType,
  AstrologicalSignOppositeResolver$data,
>*/);
