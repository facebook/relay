/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c6da0d2b3414feac05aacff9035bf12d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { UserConstantResolver$key } from "./UserConstantResolver.graphql";
import type { FragmentType } from "relay-runtime";
import {constant as userConstantResolverType} from "../UserConstantResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userConstantResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userConstantResolverType: (
  rootKey: UserConstantResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?number);
declare export opaque type UserConstantDependentResolver$fragmentType: FragmentType;
export type UserConstantDependentResolver$data = {|
  +constant: ?number,
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
      "resolverModule": require('../UserConstantResolver').constant,
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
