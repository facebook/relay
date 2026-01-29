/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1794e78bb43d7aee1a7a2741f6b03bf8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { LiveState, DataID } from "relay-runtime";
import {live_user_resolver_always_suspend as queryLiveUserResolverAlwaysSuspendResolverType} from "../resolvers/LiveUserAlwaysSuspendResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryLiveUserResolverAlwaysSuspendResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryLiveUserResolverAlwaysSuspendResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?{|
  +id: DataID,
|}>);
export type RelayReaderRequiredFieldsTest28Query$variables = {||};
export type RelayReaderRequiredFieldsTest28Query$data = {|
  +live_user_resolver_always_suspend: {|
    +name: ?string,
  |},
|};
export type RelayReaderRequiredFieldsTest28Query = {|
  response: RelayReaderRequiredFieldsTest28Query$data,
  variables: RelayReaderRequiredFieldsTest28Query$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayReaderRequiredFieldsTest28Query",
    "selections": [
      {
        "kind": "RequiredField",
        "field": {
          "kind": "ClientEdgeToServerObject",
          "operation": require('./ClientEdgeQuery_RelayReaderRequiredFieldsTest28Query_live_user_resolver_always_suspend.graphql'),
          "backingField": {
            "alias": null,
            "args": null,
            "fragment": null,
            "kind": "RelayLiveResolver",
            "name": "live_user_resolver_always_suspend",
            "resolverModule": require('../resolvers/LiveUserAlwaysSuspendResolver').live_user_resolver_always_suspend,
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
        },
        "action": "THROW"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest28Query",
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
    "cacheID": "fb8240592c2eefb489c064bb56f44668",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest28Query",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "1ea17c6315e8ba285db304130201310d";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayReaderRequiredFieldsTest28Query$variables,
  RelayReaderRequiredFieldsTest28Query$data,
>*/);
