/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e6414ea5945accfca47244cabdd3a907>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type RelayMockEnvironmentWithComponentsTestWorldClassFeatureQueryVariables = {|
  userId: string,
|};
export type RelayMockEnvironmentWithComponentsTestWorldClassFeatureQueryResponse = {|
  +user: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestWorldClassFeatureQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestWorldClassFeatureQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestWorldClassFeatureQueryResponse,
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
    "name": "RelayMockEnvironmentWithComponentsTestWorldClassFeatureQuery",
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
    "name": "RelayMockEnvironmentWithComponentsTestWorldClassFeatureQuery",
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
    "cacheID": "0731919b754e27166d990aec021f2e80",
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
    "name": "RelayMockEnvironmentWithComponentsTestWorldClassFeatureQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestWorldClassFeatureQuery(\n  $userId: ID!\n) {\n  user: node(id: $userId) {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "dc18b1545e059ab74a8a0209a0c58b60";
}

module.exports = node;
