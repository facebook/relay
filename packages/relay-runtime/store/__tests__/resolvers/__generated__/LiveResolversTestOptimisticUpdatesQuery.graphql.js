/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<99535ee92c29f2b0029d1a1c2db47ea4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserGreetingResolver$key } from "./UserGreetingResolver.graphql";
import {greeting as userGreetingResolverType} from "../UserGreetingResolver.js";
import type { TestResolverContextType } from "../../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userGreetingResolverType: (
  rootKey: UserGreetingResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type LiveResolversTestOptimisticUpdatesQuery$variables = {||};
export type LiveResolversTestOptimisticUpdatesQuery$data = {|
  +me: ?{|
    +greeting: ?string,
  |},
|};
export type LiveResolversTestOptimisticUpdatesQuery = {|
  response: LiveResolversTestOptimisticUpdatesQuery$data,
  variables: LiveResolversTestOptimisticUpdatesQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestOptimisticUpdatesQuery",
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
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserGreetingResolver"
            },
            "kind": "RelayResolver",
            "name": "greeting",
            "resolverModule": require('../UserGreetingResolver').greeting,
            "path": "me.greeting"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTestOptimisticUpdatesQuery",
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
            "name": "greeting",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "name",
                  "storageKey": null
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
          },
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
    ]
  },
  "params": {
    "cacheID": "b8daebf830b9fd491f8038d470953c19",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestOptimisticUpdatesQuery",
    "operationKind": "query",
    "text": "query LiveResolversTestOptimisticUpdatesQuery {\n  me {\n    ...UserGreetingResolver\n    id\n  }\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "ea37ac9c431e038b966fc6ca9e096241";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTestOptimisticUpdatesQuery$variables,
  LiveResolversTestOptimisticUpdatesQuery$data,
>*/);
