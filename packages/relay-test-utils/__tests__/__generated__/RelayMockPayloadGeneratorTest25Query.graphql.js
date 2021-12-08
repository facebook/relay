/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<f0b81c9fb4cef0fc749056de5c9e756d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest25Query$variables = {||};
export type RelayMockPayloadGeneratorTest25QueryVariables = RelayMockPayloadGeneratorTest25Query$variables;
export type RelayMockPayloadGeneratorTest25Query$data = {|
  +node: ?{|
    +id?: string,
    +name?: ?string,
    +pageName?: ?string,
  |},
|};
export type RelayMockPayloadGeneratorTest25QueryResponse = RelayMockPayloadGeneratorTest25Query$data;
export type RelayMockPayloadGeneratorTest25Query = {|
  variables: RelayMockPayloadGeneratorTest25QueryVariables,
  response: RelayMockPayloadGeneratorTest25Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "my-id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v3 = {
  "alias": "pageName",
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v4 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest25Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              (v2/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v1/*: any*/),
              (v3/*: any*/)
            ],
            "type": "Page",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest25Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
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
          (v1/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/)
            ],
            "type": "User",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              (v3/*: any*/)
            ],
            "type": "Page",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "1911c1afeaa9e4bc724dafc98773cd16",
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
        "node.name": (v4/*: any*/),
        "node.pageName": (v4/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest25Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest25Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      name\n    }\n    ... on Page {\n      id\n      pageName: name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2a2f3263c9309ccf610b5451867aba98";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest25Query$variables,
  RelayMockPayloadGeneratorTest25Query$data,
>*/);
