/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b4d60393f1b4e1b4677b36695ffb1e72>>
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
declare export opaque type waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType: FragmentType;
export type waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$data = {|
  +always_throws: ?string,
  +$fragmentType: waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType,
|};
export type waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$key = {
  +$data?: waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$data,
  +$fragmentSpreads: waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "throwOnFieldError": true
  },
  "name": "waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment",
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
  (node/*: any*/).hash = "f11b5197bd977bdd6b5b7b85e954ea08";
}

module.exports = ((node/*: any*/)/*: Fragment<
  waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$fragmentType,
  waitForFragmentDataTestResolverErrorWithThrowOnFieldErrorFragment$data,
>*/);
