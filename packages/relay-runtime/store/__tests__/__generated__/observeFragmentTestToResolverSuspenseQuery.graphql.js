/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<251352b3e01dad80ebff105e8362a2f0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { observeFragmentTestToResolverSuspenseFragment$fragmentType } from "./observeFragmentTestToResolverSuspenseFragment.graphql";
export type observeFragmentTestToResolverSuspenseQuery$variables = {||};
export type observeFragmentTestToResolverSuspenseQuery$data = {|
  +me: ?{|
    +$fragmentSpreads: observeFragmentTestToResolverSuspenseFragment$fragmentType,
  |},
|};
export type observeFragmentTestToResolverSuspenseQuery = {|
  response: observeFragmentTestToResolverSuspenseQuery$data,
  variables: observeFragmentTestToResolverSuspenseQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeFragmentTestToResolverSuspenseQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "observeFragmentTestToResolverSuspenseFragment"
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
    "name": "observeFragmentTestToResolverSuspenseQuery",
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
            "kind": "ClientExtension",
            "selections": [
              {
                "name": "counter_suspends_when_odd",
                "args": null,
                "fragment": null,
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
              }
            ]
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
    "cacheID": "4a7181d1cdcec98342447b276a4cc658",
    "id": null,
    "metadata": {},
    "name": "observeFragmentTestToResolverSuspenseQuery",
    "operationKind": "query",
    "text": "query observeFragmentTestToResolverSuspenseQuery {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "8a0fc18dd1ed0c3069931597ed10b9a2";
}

module.exports = ((node/*: any*/)/*: Query<
  observeFragmentTestToResolverSuspenseQuery$variables,
  observeFragmentTestToResolverSuspenseQuery$data,
>*/);
