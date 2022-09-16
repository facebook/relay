/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<fa5805da50ea0ce77c55b658e64bb26f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { FragmentType } from "relay-runtime";
import userCounterSuspendsWhenOddResolver from "../../../relay-runtime/store/__tests__/resolvers/CounterSuspendsWhenOddOnUser.js";
// Type assertion validating that `userCounterSuspendsWhenOddResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userCounterSuspendsWhenOddResolver: () => LiveState<any>);
declare export opaque type LiveResolversTestCounterUserFragment$fragmentType: FragmentType;
export type LiveResolversTestCounterUserFragment$data = {|
  +counter_suspends_when_odd: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof userCounterSuspendsWhenOddResolver>["read"]>,
  +$fragmentType: LiveResolversTestCounterUserFragment$fragmentType,
|};
export type LiveResolversTestCounterUserFragment$key = {
  +$data?: LiveResolversTestCounterUserFragment$data,
  +$fragmentSpreads: LiveResolversTestCounterUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LiveResolversTestCounterUserFragment",
  "selections": [
    {
      "kind": "ClientExtension",
      "selections": [
        {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "counter_suspends_when_odd",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/CounterSuspendsWhenOddOnUser'),
          "path": "counter_suspends_when_odd"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b2185430d34bfbf0eadad14f4e9f8869";
}

module.exports = ((node/*: any*/)/*: Fragment<
  LiveResolversTestCounterUserFragment$fragmentType,
  LiveResolversTestCounterUserFragment$data,
>*/);
