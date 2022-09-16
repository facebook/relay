/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f86dc8f86062bd92e1fab9ab670d97d3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { UserNameAndCounterSuspendsWhenOdd$key } from "./../../../relay-runtime/store/__tests__/resolvers/__generated__/UserNameAndCounterSuspendsWhenOdd.graphql";
import type { FragmentType } from "relay-runtime";
import queryUserNameAndCounterSuspendsWhenOddResolver from "../../../relay-runtime/store/__tests__/resolvers/UserNameAndCounterSuspendsWhenOdd.js";
// Type assertion validating that `queryUserNameAndCounterSuspendsWhenOddResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryUserNameAndCounterSuspendsWhenOddResolver: (
  rootKey: UserNameAndCounterSuspendsWhenOdd$key, 
) => mixed);
declare export opaque type LiveResolversTest6Fragment$fragmentType: FragmentType;
export type LiveResolversTest6Fragment$data = {|
  +user_name_and_counter_suspends_when_odd: ?$Call<<R>((...empty[]) => R) => R, typeof queryUserNameAndCounterSuspendsWhenOddResolver>,
  +$fragmentType: LiveResolversTest6Fragment$fragmentType,
|};
export type LiveResolversTest6Fragment$key = {
  +$data?: LiveResolversTest6Fragment$data,
  +$fragmentSpreads: LiveResolversTest6Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "LiveResolversTest6Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "fragment": {
        "args": null,
        "kind": "FragmentSpread",
        "name": "UserNameAndCounterSuspendsWhenOdd"
      },
      "kind": "RelayResolver",
      "name": "user_name_and_counter_suspends_when_odd",
      "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/UserNameAndCounterSuspendsWhenOdd'),
      "path": "user_name_and_counter_suspends_when_odd"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8560c4e8dca344c329c971c6f28882b8";
}

module.exports = ((node/*: any*/)/*: Fragment<
  LiveResolversTest6Fragment$fragmentType,
  LiveResolversTest6Fragment$data,
>*/);
