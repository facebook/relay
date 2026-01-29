/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<20d020948201bd947ae921b85d61f9d2>>
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
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryCounterResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterResolverType: (
  rootKey: LiveCounterResolver$key,
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
declare export opaque type CounterPlusOneResolver$fragmentType: FragmentType;
export type CounterPlusOneResolver$data = {|
  +counter: NonNullable<?number>,
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
        "resolverModule": require('../LiveCounterResolver').counter,
        "path": "counter"
      },
      "action": "THROW"
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
