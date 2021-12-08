/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b3ad2a655c59f6eae729f38af3c757d0>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType = any;
export type RelayMockEnvironmentWithComponentsTestImpressiveResultQuery$variables = {|
  id: string,
|};
export type RelayMockEnvironmentWithComponentsTestImpressiveResultQueryVariables = RelayMockEnvironmentWithComponentsTestImpressiveResultQuery$variables;
export type RelayMockEnvironmentWithComponentsTestImpressiveResultQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment$fragmentType,
  |},
|};
export type RelayMockEnvironmentWithComponentsTestImpressiveResultQueryResponse = RelayMockEnvironmentWithComponentsTestImpressiveResultQuery$data;
export type RelayMockEnvironmentWithComponentsTestImpressiveResultQuery = {|
  variables: RelayMockEnvironmentWithComponentsTestImpressiveResultQueryVariables,
  response: RelayMockEnvironmentWithComponentsTestImpressiveResultQuery$data,
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
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockEnvironmentWithComponentsTestImpressiveResultQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayMockEnvironmentWithComponentsTestImpressiveResultQuery",
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
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "websites",
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c23b3537566b960878479374cb9220cf",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Node"
        },
        "node.__typename": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "String"
        },
        "node.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "node.name": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "String"
        },
        "node.websites": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "String"
        }
      }
    },
    "name": "RelayMockEnvironmentWithComponentsTestImpressiveResultQuery",
    "operationKind": "query",
    "text": "query RelayMockEnvironmentWithComponentsTestImpressiveResultQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment\n    id\n  }\n}\n\nfragment RelayMockEnvironmentWithComponentsTestUsefulAwesomenessFragment on Page {\n  id\n  name\n  websites\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "eec1fb2dd0c1d0773d8745926c5fdd09";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockEnvironmentWithComponentsTestImpressiveResultQuery$variables,
  RelayMockEnvironmentWithComponentsTestImpressiveResultQuery$data,
>*/);
