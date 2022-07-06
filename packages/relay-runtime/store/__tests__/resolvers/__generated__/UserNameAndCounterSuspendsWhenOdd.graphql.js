/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5704f54ca20a96a9b35ceba2b9ba3a8e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type CounterSuspendsWhenOdd$key = any;
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { FragmentType } from "relay-runtime";
import queryCounterSuspendsWhenOddResolver from "../CounterSuspendsWhenOdd.js";
// Type assertion validating that `queryCounterSuspendsWhenOddResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryCounterSuspendsWhenOddResolver: (
  rootKey: CounterSuspendsWhenOdd$key, 
) => LiveState<any>);
declare export opaque type UserNameAndCounterSuspendsWhenOdd$fragmentType: FragmentType;
export type UserNameAndCounterSuspendsWhenOdd$data = {|
  +counter_suspends_when_odd: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryCounterSuspendsWhenOddResolver>["read"]>,
  +me: ?{|
    +name: ?string,
  |},
  +$fragmentType: UserNameAndCounterSuspendsWhenOdd$fragmentType,
|};
export type UserNameAndCounterSuspendsWhenOdd$key = {
  +$data?: UserNameAndCounterSuspendsWhenOdd$data,
  +$fragmentSpreads: UserNameAndCounterSuspendsWhenOdd$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserNameAndCounterSuspendsWhenOdd",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
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
      "resolverModule": require('./../CounterSuspendsWhenOdd'),
      "path": "counter_suspends_when_odd"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "1a64e6e5a1ce87aa12f684231ab0da09";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserNameAndCounterSuspendsWhenOdd$fragmentType,
  UserNameAndCounterSuspendsWhenOdd$data,
>*/);
