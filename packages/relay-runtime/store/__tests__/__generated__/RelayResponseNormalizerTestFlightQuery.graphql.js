/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<6bd6648100a77b8f4c45f5447836ddd5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @ReactFlightServerDependency FlightComponent.server

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayResponseNormalizerTestFlightQuery$variables = {|
  count: number,
  id: string,
|};
export type RelayResponseNormalizerTestFlightQuery$data = {|
  +node: ?{|
    +flightComponent?: ?any,
  |},
|};
export type RelayResponseNormalizerTestFlightQuery = {|
  response: RelayResponseNormalizerTestFlightQuery$data,
  variables: RelayResponseNormalizerTestFlightQuery$variables,
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
    "name": "RelayResponseNormalizerTestFlightQuery",
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
    "name": "RelayResponseNormalizerTestFlightQuery",
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
    "cacheID": "0330b8661d511af1582b5bd6409a4b93",
    "id": null,
    "metadata": {},
    "name": "RelayResponseNormalizerTestFlightQuery",
    "operationKind": "query",
    "text": "query RelayResponseNormalizerTestFlightQuery(\n  $id: ID!\n  $count: Int!\n) {\n  node(id: $id) {\n    __typename\n    ... on Story {\n      flightComponent: flight(component: \"FlightComponent.server\", props: {condition: true, count: $count, id: $id})\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ff8e6b8262a0c8e39f55eaf9638a7c88";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayResponseNormalizerTestFlightQuery$variables,
  RelayResponseNormalizerTestFlightQuery$data,
>*/);
