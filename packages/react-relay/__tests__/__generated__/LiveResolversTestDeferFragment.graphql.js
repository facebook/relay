/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2cff16ba28615a46e0243f5f23a8da64>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { CounterSuspendsWhenOdd$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/CounterSuspendsWhenOdd.graphql";
import type { LiveState, FragmentType } from "relay-runtime";
import {counter_suspends_when_odd as queryCounterSuspendsWhenOddResolverType} from "../../../relay-runtime/store/__tests__/resolvers/CounterSuspendsWhenOdd.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterSuspendsWhenOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterSuspendsWhenOddResolverType: (
  rootKey: CounterSuspendsWhenOdd$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
declare export opaque type LiveResolversTestDeferFragment$fragmentType: FragmentType;
export type LiveResolversTestDeferFragment$data = {|
  +counter_suspends_when_odd: ?number,
  +$fragmentType: LiveResolversTestDeferFragment$fragmentType,
|};
export type LiveResolversTestDeferFragment$key = {
  +$data?: LiveResolversTestDeferFragment$data,
  +$fragmentSpreads: LiveResolversTestDeferFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LiveResolversTestDeferFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "CounterSuspendsWhenOdd"
      },
      "kind": "RelayLiveResolver",
      "name": "counter_suspends_when_odd",
      "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/CounterSuspendsWhenOdd').counter_suspends_when_odd,
      "path": "counter_suspends_when_odd"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "b0021654a94dd7cd7005caf576f7ba36";
}

module.exports = ((node/*: any*/)/*: Fragment<
  LiveResolversTestDeferFragment$fragmentType,
  LiveResolversTestDeferFragment$data,
>*/);
