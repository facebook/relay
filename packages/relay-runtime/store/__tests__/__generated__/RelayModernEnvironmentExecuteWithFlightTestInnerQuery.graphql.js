/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3064dabe869d67d4c7c1746c52fe9811>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteWithFlightTestInnerQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteWithFlightTestInnerQueryVariables = RelayModernEnvironmentExecuteWithFlightTestInnerQuery$variables;
export type RelayModernEnvironmentExecuteWithFlightTestInnerQuery$data = {|
  +node: ?{|
    +name?: ?string,
  |},
|};
export type RelayModernEnvironmentExecuteWithFlightTestInnerQueryResponse = RelayModernEnvironmentExecuteWithFlightTestInnerQuery$data;
export type RelayModernEnvironmentExecuteWithFlightTestInnerQuery = {|
  variables: RelayModernEnvironmentExecuteWithFlightTestInnerQueryVariables,
  response: RelayModernEnvironmentExecuteWithFlightTestInnerQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
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
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithFlightTestInnerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteWithFlightTestInnerQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
          (v2/*: any*/),
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
    "cacheID": "5bcfc11827ad90de437d3ab08d3382b1",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithFlightTestInnerQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithFlightTestInnerQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b2fdcec723be1551d06257004e593265";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithFlightTestInnerQuery$variables,
  RelayModernEnvironmentExecuteWithFlightTestInnerQuery$data,
>*/);
