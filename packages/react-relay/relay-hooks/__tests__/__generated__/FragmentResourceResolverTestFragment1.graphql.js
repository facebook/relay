/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0884675d46abcd390c64fb5695397362>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
import userAlwaysThrowsResolver from "../../../../relay-test-utils-internal/resolvers/UserAlwaysThrowsResolver.js";
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
      "resolverModule": require('./../../../../relay-test-utils-internal/resolvers/UserAlwaysThrowsResolver.js'),
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
