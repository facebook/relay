/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<710e1977781d3bd2713b052561de0e03>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState } from "relay-runtime/store/experimental-live-resolvers/LiveResolverStore";
import type { LiveExternalGreetingFragment$key } from "./LiveExternalGreetingFragment.graphql";
import {live_external_greeting as queryLiveExternalGreetingResolver} from "../LiveExternalGreeting.js";
// Type assertion validating that `queryLiveExternalGreetingResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveExternalGreetingResolver: (
  rootKey: LiveExternalGreetingFragment$key, 
) => LiveState<any>);
import {live_user_suspends_when_odd as queryLiveUserSuspendsWhenOddResolver} from "../LiveUserSuspendsWhenOdd.js";
// Type assertion validating that `queryLiveUserSuspendsWhenOddResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveUserSuspendsWhenOddResolver: () => LiveState<any>);
export type LiveResolversTestUnsubscribesWhenSuspendsQuery$variables = {||};
export type LiveResolversTestUnsubscribesWhenSuspendsQuery$data = {|
  +greeting: ?$Call<$Call<<R>((...empty[]) => R) => R, typeof queryLiveExternalGreetingResolver>["read"]>,
  +user: ?{|
    +id: string,
  |},
|};
export type LiveResolversTestUnsubscribesWhenSuspendsQuery = {|
  response: LiveResolversTestUnsubscribesWhenSuspendsQuery$data,
  variables: LiveResolversTestUnsubscribesWhenSuspendsQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
  "name": "live_user_suspends_when_odd",
  "args": null,
  "fragment": null,
  "kind": "RelayResolver",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "LiveResolversTestUnsubscribesWhenSuspendsQuery",
    "selections": [
      {
        "kind": "ClientEdgeToServerObject",
        "operation": require('./ClientEdgeQuery_LiveResolversTestUnsubscribesWhenSuspendsQuery_user.graphql'),
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
              "name": "id",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      },
      {
        "alias": "greeting",
        "args": null,
        "fragment": {
          "args": null,
          "kind": "FragmentSpread",
          "name": "LiveExternalGreetingFragment"
        },
        "kind": "RelayLiveResolver",
        "name": "live_external_greeting",
        "resolverModule": require('./../LiveExternalGreeting').live_external_greeting,
        "path": "greeting"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTestUnsubscribesWhenSuspendsQuery",
    "selections": [
      (v0/*: any*/),
      {
        "name": "live_external_greeting",
        "args": null,
        "fragment": {
          "kind": "InlineFragment",
          "selections": [
            (v0/*: any*/)
          ],
          "type": "Query",
          "abstractKey": null
        },
        "kind": "RelayResolver",
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0a6a353145d84744654ce528a5edca30",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestUnsubscribesWhenSuspendsQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "06f9d01a4042d27c7e069bc35d4694c1";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestUnsubscribesWhenSuspendsQuery$variables,
  LiveResolversTestUnsubscribesWhenSuspendsQuery$data,
>*/);
