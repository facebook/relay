/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<4b834dd16f59d8b359cb004472f35e6f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { CounterSuspendsWhenOdd$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/CounterSuspendsWhenOdd.graphql";
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { FragmentType } from "relay-runtime";
import {counter_suspends_when_odd as queryCounterSuspendsWhenOddResolverType} from "../../../relay-runtime/store/__tests__/resolvers/CounterSuspendsWhenOdd.js";
// Type assertion validating that `queryCounterSuspendsWhenOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterSuspendsWhenOddResolverType: (
  rootKey: CounterSuspendsWhenOdd$key,
) => LiveState<mixed>);
declare export opaque type LiveResolversTest5Fragment$fragmentType: FragmentType;
export type LiveResolversTest5Fragment$data = {|
  +counter_suspends_when_odd: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterSuspendsWhenOddResolverType>["read"]>,
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
      "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/CounterSuspendsWhenOdd').counter_suspends_when_odd,
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
