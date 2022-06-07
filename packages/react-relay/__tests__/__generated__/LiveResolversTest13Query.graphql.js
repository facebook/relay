/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0e72f5a78b970707f3d9f84cfe005f5c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type LiveResolversTest13Query$variables = {||};
export type LiveResolversTest13Query$data = {|
  +live_constant_client_edge: ?{|
    +name: ?string,
  |},
|};
export type LiveResolversTest13Query = {|
  response: LiveResolversTest13Query$data,
  variables: LiveResolversTest13Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "LiveResolversTest13Query",
    "selections": [
      {
        "kind": "ClientEdgeToServerObject",
        "operation": require('./ClientEdgeQuery_LiveResolversTest13Query_live_constant_client_edge.graphql'),
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayLiveResolver",
          "name": "live_constant_client_edge",
          "resolverModule": require('./../../../relay-runtime/store/__tests__/resolvers/LiveConstantClientEdgeResolver.js'),
          "path": "live_constant_client_edge"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "live_constant_client_edge",
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
    "name": "LiveResolversTest13Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__typename",
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "6ec98599d8edc2ea9337de04801eb284",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTest13Query",
    "operationKind": "query",
    "text": "query LiveResolversTest13Query {\n  __typename\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "5e0a692af3d1acd9f3fbcb5fe00b0e77";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTest13Query$variables,
  LiveResolversTest13Query$data,
>*/);
