/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<4bc10cadac48f3045f6941d48b396e06>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @ReactFlightServerDependency FlightComponent.server

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteWithFlightTestFlightQuery$variables = {|
  id: string,
  count: number,
|};
export type RelayModernEnvironmentExecuteWithFlightTestFlightQueryVariables = RelayModernEnvironmentExecuteWithFlightTestFlightQuery$variables;
export type RelayModernEnvironmentExecuteWithFlightTestFlightQuery$data = {|
  +node: ?{|
    +flightComponent?: ?any,
  |},
|};
export type RelayModernEnvironmentExecuteWithFlightTestFlightQueryResponse = RelayModernEnvironmentExecuteWithFlightTestFlightQuery$data;
export type RelayModernEnvironmentExecuteWithFlightTestFlightQuery = {|
  variables: RelayModernEnvironmentExecuteWithFlightTestFlightQueryVariables,
  response: RelayModernEnvironmentExecuteWithFlightTestFlightQuery$data,
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
v2 = {
  "kind": "Variable",
  "name": "id",
  "variableName": "id"
},
v3 = [
  (v2/*: any*/)
],
v4 = {
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
            (v2/*: any*/)
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
    "name": "RelayModernEnvironmentExecuteWithFlightTestFlightQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/)
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
    "name": "RelayModernEnvironmentExecuteWithFlightTestFlightQuery",
    "selections": [
      {
        "alias": null,
        "args": (v3/*: any*/),
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
          (v4/*: any*/),
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
    "cacheID": "6253e6b9124de07a9d1fa7f9a8274790",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithFlightTestFlightQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithFlightTestFlightQuery(\n  $id: ID!\n  $count: Int!\n) {\n  node(id: $id) {\n    __typename\n    ... on Story {\n      flightComponent: flight(component: \"FlightComponent.server\", props: {condition: true, count: $count, id: $id})\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "dd0fa7d8034b2f3bba51ca36fbec30b0";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithFlightTestFlightQuery$variables,
  RelayModernEnvironmentExecuteWithFlightTestFlightQuery$data,
>*/);
