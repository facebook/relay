/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f0b9125ba9a02e62a70cd19a9cdac764>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery$variables = {|
  pageId: string,
|};
export type RelayMockEnvironmentWithComponentsTestRedefiningSolutionQueryVariables = RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery$variables;
export type RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery$data = {|
  +page: ?{|
    +id: string,
    +name: ?string,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestRedefiningSolutionQueryResponse = RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery$data;
export type RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestRedefiningSolutionQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "pageId"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "pageId"
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
    "name": "RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery",
    "selections": [
      {
        "alias": "page",
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
    "name": "RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery",
    "selections": [
      {
        "alias": "page",
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
    "cacheID": "787ec09528cd965f4cb945b9e40812c7",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "page": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "page.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "page.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "page.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        }
      }
    },
    "name": "RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery(\n  $pageId: ID!\n) {\n  page: node(id: $pageId) {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "616bf865993fd8a6059f8c5dc641de63";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery$variables,
  RelayMockEnvironmentWithComponentsTestRedefiningSolutionQuery$data,
>*/);
