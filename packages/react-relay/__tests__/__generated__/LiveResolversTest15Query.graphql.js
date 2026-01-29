/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<b8bd42bba1b074caf08e771e61836531>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState, DataID } from "relay-runtime";
import {live_user_resolver_always_suspend as queryLiveUserResolverAlwaysSuspendResolverType} from "../../../relay-runtime/store/__tests__/resolvers/LiveUserAlwaysSuspendResolver.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryLiveUserResolverAlwaysSuspendResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveUserResolverAlwaysSuspendResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?{|
  +id: DataID,
|}>);
export type LiveResolversTest15Query$variables = {||};
export type LiveResolversTest15Query$data = {|
  +live_user_resolver_always_suspend: ?{|
    +name: ?string,
  |},
|};
export type LiveResolversTest15Query = {|
  response: LiveResolversTest15Query$data,
  variables: LiveResolversTest15Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "LiveResolversTest15Query",
    "selections": [
      {
        "kind": "ClientEdgeToServerObject",
        "operation": require('./ClientEdgeQuery_LiveResolversTest15Query_live_user_resolver_always_suspend.graphql'),
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "live_user_resolver_always_suspend",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/LiveUserAlwaysSuspendResolver').live_user_resolver_always_suspend,
          "path": "live_user_resolver_always_suspend"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "live_user_resolver_always_suspend",
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
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTest15Query",
    "selections": [
      {
        "name": "live_user_resolver_always_suspend",
        "args": null,
        "fragment": null,
        "kind": "RelayResolver",
        "storageKey": null,
        "isOutputType": false
      }
    ]
  },
  "params": {
    "cacheID": "076de4b480b18d953185941a880543b3",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest15Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "649fcb31c6138f80ad0ebb97c80d9ae6";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  LiveResolversTest15Query$variables,
  LiveResolversTest15Query$data,
>*/);
