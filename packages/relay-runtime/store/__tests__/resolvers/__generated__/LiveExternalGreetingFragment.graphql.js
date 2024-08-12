/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<773bdb0346b68047125a66029fa6d9d8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { LiveState, FragmentType, DataID } from "relay-runtime";
import {live_user_suspends_when_odd as queryLiveUserSuspendsWhenOddResolverType} from "../LiveUserSuspendsWhenOdd.js";
import type { TestLiveResolverContextType } from "../../../../mutations/__tests__/TestLiveResolverContextType";
// Type assertion validating that `queryLiveUserSuspendsWhenOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveUserSuspendsWhenOddResolverType: (
  key: void,
  args: void,
  context: TestLiveResolverContextType,
) => LiveState<?{|
  +id: DataID,
|}>);
declare export opaque type LiveExternalGreetingFragment$fragmentType: FragmentType;
export type LiveExternalGreetingFragment$data = {|
  +user: ?{|
    +name: ?string,
  |},
  +$fragmentType: LiveExternalGreetingFragment$fragmentType,
|};
export type LiveExternalGreetingFragment$key = {
  +$data?: LiveExternalGreetingFragment$data,
  +$fragmentSpreads: LiveExternalGreetingFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "hasClientEdges": true
  },
  "name": "LiveExternalGreetingFragment",
  "selections": [
    {
      "kind": "ClientEdgeToServerObject",
      "operation": require('./ClientEdgeQuery_LiveExternalGreetingFragment_user.graphql'),
      "backingField": {
        "alias": "user",
        "args": null,
        "fragment": null,
        "kind": "RelayLiveResolver",
        "name": "live_user_suspends_when_odd",
        "resolverModule": require('./../LiveUserSuspendsWhenOdd').live_user_suspends_when_odd,
        "path": "user"
      },
      "linkedField": {
        "alias": "user",
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "live_user_suspends_when_odd",
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
      }
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d99958d995a71b9db58b73932515179f";
}

module.exports = ((node/*: any*/)/*: Fragment<
  LiveExternalGreetingFragment$fragmentType,
  LiveExternalGreetingFragment$data,
>*/);
