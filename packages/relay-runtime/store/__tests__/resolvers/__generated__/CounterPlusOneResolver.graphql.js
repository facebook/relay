/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f8fdc40c45ab8ec19913bcd00ad7b6e7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { LiveCounterResolver$key } from "./LiveCounterResolver.graphql";
import type { LiveState, FragmentType } from "relay-runtime";
import {counter as queryCounterResolverType} from "../LiveCounterResolver.js";
import type { LiveResolverContextType } from "../../../../mutations/__tests__/LiveResolverContextType";
// Type assertion validating that `queryCounterResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolverType: (
  rootKey: LiveCounterResolver$key,
  _: void,
  context: LiveResolverContextType,
) => LiveState<?number>);
declare export opaque type CounterPlusOneResolver$fragmentType: FragmentType;
export type CounterPlusOneResolver$data = {|
  +counter: $NonMaybeType<?number>,
  +$fragmentType: CounterPlusOneResolver$fragmentType,
|};
export type CounterPlusOneResolver$key = {
  +$data?: CounterPlusOneResolver$data,
  +$fragmentSpreads: CounterPlusOneResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "CounterPlusOneResolver",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LiveCounterResolver"
        },
        "kind": "RelayLiveResolver",
        "name": "counter",
        "resolverModule": require('./../LiveCounterResolver').counter,
        "path": "counter"
      },
      "action": "THROW",
      "path": "counter"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "5c197a1dfaa6945a727e92cd1996348d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  CounterPlusOneResolver$fragmentType,
  CounterPlusOneResolver$data,
>*/);
