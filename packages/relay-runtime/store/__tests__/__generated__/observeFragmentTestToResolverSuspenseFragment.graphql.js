/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<91ca3384c78d5802b0fce25e728f276b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { LiveState, FragmentType } from "relay-runtime";
import {counter_suspends_when_odd as userCounterSuspendsWhenOddResolverType} from "../resolvers/CounterSuspendsWhenOddOnUser.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userCounterSuspendsWhenOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userCounterSuspendsWhenOddResolverType as (
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
declare export opaque type observeFragmentTestToResolverSuspenseFragment$fragmentType: FragmentType;
export type observeFragmentTestToResolverSuspenseFragment$data = {|
  +counter_suspends_when_odd: ?number,
  +$fragmentType: observeFragmentTestToResolverSuspenseFragment$fragmentType,
|};
export type observeFragmentTestToResolverSuspenseFragment$key = {
  +$data?: observeFragmentTestToResolverSuspenseFragment$data,
  +$fragmentSpreads: observeFragmentTestToResolverSuspenseFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "observeFragmentTestToResolverSuspenseFragment",
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
          "resolverModule": require('../resolvers/CounterSuspendsWhenOddOnUser').counter_suspends_when_odd,
          "path": "counter_suspends_when_odd"
        }
      ]
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "cc94ae0928244500f6c0d7f5cefbe3c4";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  observeFragmentTestToResolverSuspenseFragment$fragmentType,
  observeFragmentTestToResolverSuspenseFragment$data,
>*/);
