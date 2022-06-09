/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<11bd8f8b325180e98b72605f45b3991d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type UserAlwaysThrowsResolver$key = any;
import type { FragmentType } from "relay-runtime";
import userAlwaysThrowsResolver from "../../../../relay-runtime/store/__tests__/resolvers/UserAlwaysThrowsResolver.js";
// Type assertion validating that `userAlwaysThrowsResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userAlwaysThrowsResolver: (
  rootKey: UserAlwaysThrowsResolver$key, 
) => mixed);
declare export opaque type FragmentResourceResolverTestFragment1$fragmentType: FragmentType;
export type FragmentResourceResolverTestFragment1$data = {|
  +always_throws: ?$Call<<R>((...empty[]) => R) => R, typeof userAlwaysThrowsResolver>,
  +$fragmentType: FragmentResourceResolverTestFragment1$fragmentType,
|};
export type FragmentResourceResolverTestFragment1$key = {
  +$data?: FragmentResourceResolverTestFragment1$data,
  +$fragmentSpreads: FragmentResourceResolverTestFragment1$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "FragmentResourceResolverTestFragment1",
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
      "resolverModule": require('./../../../../relay-runtime/store/__tests__/resolvers/UserAlwaysThrowsResolver.js'),
      "path": "always_throws"
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "26b091667810d9dd43454b017d58fd0c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  FragmentResourceResolverTestFragment1$fragmentType,
  FragmentResourceResolverTestFragment1$data,
>*/);
