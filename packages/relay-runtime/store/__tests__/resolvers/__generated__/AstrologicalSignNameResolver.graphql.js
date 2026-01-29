/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<38933717a4dd9580ce42a8f5e903418f>>
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
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `astrologicalSignSelfResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(astrologicalSignSelfResolverType: (
  rootKey: AstrologicalSignSelfResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?unknown);
declare export opaque type AstrologicalSignNameResolver$fragmentType: FragmentType;
export type AstrologicalSignNameResolver$data = {|
  +self: ?ReturnType<typeof astrologicalSignSelfResolverType>,
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
      "resolverModule": require('../AstrologicalSignSelfResolver').self,
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
