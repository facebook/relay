/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<673229c10c4951dfc104568414e88676>>
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
import queryLiveExternalGreetingResolver from "../LiveExternalGreeting.js";
// Type assertion validating that `queryLiveExternalGreetingResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveExternalGreetingResolver: (
  rootKey: LiveExternalGreetingFragment$key, 
) => LiveState<any>);
import queryLiveUserSuspendsWhenOddResolver from "../LiveUserSuspendsWhenOdd.js";
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

var node/*: ClientRequest*/ = {
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
          "resolverModule": require('./../LiveUserSuspendsWhenOdd'),
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
        "resolverModule": require('./../LiveExternalGreeting'),
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
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__id",
            "storageKey": null
          }
        ]
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

if (__DEV__) {
  (node/*: any*/).hash = "06f9d01a4042d27c7e069bc35d4694c1";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTestUnsubscribesWhenSuspendsQuery$variables,
  LiveResolversTestUnsubscribesWhenSuspendsQuery$data,
>*/);
