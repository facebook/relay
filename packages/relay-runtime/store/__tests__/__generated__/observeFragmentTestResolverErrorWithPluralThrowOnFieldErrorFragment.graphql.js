/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<52031bb4fb0e8aa0917232cf78f33ed3>>
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
declare export opaque type observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$fragmentType: FragmentType;
export type observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$data = ReadonlyArray<{|
  +always_throws: ?string,
  +$fragmentType: observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$fragmentType,
|}>;
export type observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$key = ReadonlyArray<{
  +$data?: observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$data,
  +$fragmentSpreads: observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$fragmentType,
  ...
}>;
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "plural": true,
    "throwOnFieldError": true
  },
  "name": "observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment",
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
  (node/*: any*/).hash = "59a6f5ddf61e54affd5726b8cf322183";
}

module.exports = ((node/*: any*/)/*: Fragment<
  observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$fragmentType,
  observeFragmentTestResolverErrorWithPluralThrowOnFieldErrorFragment$data,
>*/);
