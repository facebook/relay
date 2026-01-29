/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6c2a76037cf9638cbf0b23ed551c0076>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { LiveState, FragmentType } from "relay-runtime";
import {counter_suspends_when_odd as userCounterSuspendsWhenOddResolverType} from "../../../relay-runtime/store/__tests__/resolvers/CounterSuspendsWhenOddOnUser.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userCounterSuspendsWhenOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userCounterSuspendsWhenOddResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
declare export opaque type LiveResolversTestCounterUserFragment$fragmentType: FragmentType;
export type LiveResolversTestCounterUserFragment$data = {|
  +counter_suspends_when_odd: ?number,
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
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/CounterSuspendsWhenOddOnUser').counter_suspends_when_odd,
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
