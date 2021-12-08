/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5bc84cb65a328f084cf13fd3e3c6c076>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @ReactFlightServerDependency FlightComponent.server

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery$variables = {|
  id: string,
  count: number,
|};
export type RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQueryVariables = RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery$variables;
export type RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery$data = {|
  +node: ?{|
    +flightComponent?: ?any,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQueryResponse = RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery$data;
export type RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery = {|
  variables: RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQueryVariables,
  response: RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "count"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": "flightComponent",
      "args": [
        {
          "kind": "Literal",
          "name": "component",
          "value": "FlightComponent.server"
        },
        {
          "fields": [
            {
              "kind": "Literal",
              "name": "condition",
              "value": true
            },
            {
              "kind": "Variable",
              "name": "count",
              "variableName": "count"
            },
            {
              "kind": "Literal",
              "name": "id",
              "value": "x"
            }
          ],
          "kind": "ObjectValue",
          "name": "props"
        }
      ],
      "kind": "FlightField",
      "name": "flight",
      "storageKey": null
    }
  ],
  "type": "Story",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v3/*: any*/),
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
    "cacheID": "3b418060ab265ecc5c7746282402c5c2",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery(\n  $id: ID!\n  $count: Int!\n) {\n  node(id: $id) {\n    __typename\n    ... on Story {\n      flightComponent: flight(component: \"FlightComponent.server\", props: {condition: true, count: $count, id: \"x\"})\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a8576cffa1a503ae3169c301dbe17dc9";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery$variables,
  RelayModernEnvironmentExecuteMutationWithFlightTest_FlightQuery$data,
>*/);
