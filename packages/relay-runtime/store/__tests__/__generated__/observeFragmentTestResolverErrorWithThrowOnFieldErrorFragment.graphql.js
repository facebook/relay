/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<60afda4fdaac41660aada81a1cb1b26f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { UserAlwaysThrowsResolver$key } from "./../resolvers/__generated__/UserAlwaysThrowsResolver.graphql";
import type { FragmentType } from "relay-runtime";
import {always_throws as userAlwaysThrowsResolverType} from "../resolvers/UserAlwaysThrowsResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userAlwaysThrowsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAlwaysThrowsResolverType: (
  rootKey: UserAlwaysThrowsResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
declare export opaque type observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType: FragmentType;
export type observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$data = {|
  +always_throws: ?string,
  +$fragmentType: observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType,
|};
export type observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$key = {
  +$data?: observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$data,
  +$fragmentSpreads: observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment",
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
      "resolverModule": require('../resolvers/UserAlwaysThrowsResolver').always_throws,
      "path": "always_throws"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "997b4d0f258698db7744a357c84eaaf8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType,
  observeFragmentTestResolverErrorWithThrowOnFieldErrorFragment$data,
>*/);
