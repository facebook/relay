/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c83d00569130f0360a6b3ef8f4646abd>>
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
declare export opaque type LiveResolversTest5Fragment$fragmentType: FragmentType;
export type LiveResolversTest5Fragment$data = {|
  +counter_suspends_when_odd: ?number,
  +$fragmentType: LiveResolversTest5Fragment$fragmentType,
|};
export type LiveResolversTest5Fragment$key = {
  +$data?: LiveResolversTest5Fragment$data,
  +$fragmentSpreads: LiveResolversTest5Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LiveResolversTest5Fragment",
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
  (node/*: any*/).hash = "49a21374c8807b3c130cfd15ac123f7e";
}

module.exports = ((node/*: any*/)/*: Fragment<
  LiveResolversTest5Fragment$fragmentType,
  LiveResolversTest5Fragment$data,
>*/);
