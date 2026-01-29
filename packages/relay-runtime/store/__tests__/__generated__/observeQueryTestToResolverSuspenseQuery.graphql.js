/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e7d82f41e9632430a0c726cfe1d3bbf1>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { LiveState } from "relay-runtime";
import {counter_suspends_when_odd as userCounterSuspendsWhenOddResolverType} from "../resolvers/CounterSuspendsWhenOddOnUser.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userCounterSuspendsWhenOddResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userCounterSuspendsWhenOddResolverType: (
  args: void,
  context: TestResolverContextType,
) => LiveState<?number>);
export type observeQueryTestToResolverSuspenseQuery$variables = {||};
export type observeQueryTestToResolverSuspenseQuery$data = {|
  +me: ?{|
    +counter_suspends_when_odd: ?number,
  |},
|};
export type observeQueryTestToResolverSuspenseQuery = {|
  response: observeQueryTestToResolverSuspenseQuery$data,
  variables: observeQueryTestToResolverSuspenseQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "observeQueryTestToResolverSuspenseQuery",
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
                "alias": null,
                "args": null,
                "fragment": null,
                "kind": "RelayLiveResolver",
                "name": "counter_suspends_when_odd",
                "resolverModule": require('../resolvers/CounterSuspendsWhenOddOnUser').counter_suspends_when_odd,
                "path": "me.counter_suspends_when_odd"
              }
            ]
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
    "name": "observeQueryTestToResolverSuspenseQuery",
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
            "name": "id",
            "storageKey": null
          },
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
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "35367c8e2d47eb1f011a9ec78dbbcd71",
    "id": null,
    "metadata": {},
    "name": "observeQueryTestToResolverSuspenseQuery",
    "operationKind": "query",
    "text": "query observeQueryTestToResolverSuspenseQuery {\n  me {\n    id\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "c12131b8b3d0e8ec0de28cd1a839c2b8";
}

module.exports = ((node/*: any*/)/*: Query<
  observeQueryTestToResolverSuspenseQuery$variables,
  observeQueryTestToResolverSuspenseQuery$data,
>*/);
