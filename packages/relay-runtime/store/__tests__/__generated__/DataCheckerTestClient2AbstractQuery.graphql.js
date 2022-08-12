/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<89004fd1c45a8f86b155ec2cc5bec091>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataCheckerTestClient2Interface$fragmentType } from "./DataCheckerTestClient2Interface.graphql";
export type DataCheckerTestClient2AbstractQuery$variables = {||};
export type DataCheckerTestClient2AbstractQuery$data = {|
  +client_interface: ?{|
    +$fragmentSpreads: DataCheckerTestClient2Interface$fragmentType,
  |},
|};
export type DataCheckerTestClient2AbstractQuery = {|
  response: DataCheckerTestClient2AbstractQuery$data,
  variables: DataCheckerTestClient2AbstractQuery$variables,
|};
*/

var node/*: ClientRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "DataCheckerTestClient2AbstractQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "client_interface",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "DataCheckerTestClient2Interface"
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "DataCheckerTestClient2AbstractQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": null,
            "kind": "LinkedField",
            "name": "client_interface",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "__typename",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "description",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "clientAbstractTypes": {
      "__isClientInterface": [
        "ClientTypeImplementingClientInterface",
        "OtherClientTypeImplementingClientInterface"
      ]
    }
  },
  "params": {
    "cacheID": "0f9ffe0ba8fc8734bf1e3947ab9a02dc",
    "id": null,
    "metadata": {},
    "name": "DataCheckerTestClient2AbstractQuery",
    "operationKind": "query",
    "text": null
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "f0fccaaeac36a9291b854982e47f5ba9";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  DataCheckerTestClient2AbstractQuery$variables,
  DataCheckerTestClient2AbstractQuery$data,
>*/);
