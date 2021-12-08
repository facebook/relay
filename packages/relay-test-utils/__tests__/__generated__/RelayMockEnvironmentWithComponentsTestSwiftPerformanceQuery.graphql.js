/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<79247eff0ab16e73b22fb7ec6588988e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery$variables = {|
  userId: string,
|};
export type RelayMockEnvironmentWithComponentsTestSwiftPerformanceQueryVariables = RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery$variables;
export type RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery$data = {|
  +user: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestSwiftPerformanceQueryResponse = RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery$data;
export type RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestSwiftPerformanceQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "userId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "userId"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery",
    "selections": [
      {
        "alias": "user",
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery",
    "selections": [
      {
        "alias": "user",
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
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3b44d613022cb53b14a4ea70ca37cda9",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "user": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "user.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "user.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "user.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery(\n  $userId: ID!\n) {\n  user: node(id: $userId) {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "63c82190819d9bae1e10591c6a8c322d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery$variables,
  RelayMockEnvironmentWithComponentsTestSwiftPerformanceQuery$data,
>*/);
