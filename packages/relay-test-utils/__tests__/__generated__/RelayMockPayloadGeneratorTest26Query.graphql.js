/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a9233639bf24be19836941f602c0183e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayMockPayloadGeneratorTest29Fragment$fragmentType = any;
type RelayMockPayloadGeneratorTest30Fragment$fragmentType = any;
export type RelayMockPayloadGeneratorTest26Query$variables = {||};
export type RelayMockPayloadGeneratorTest26QueryVariables = RelayMockPayloadGeneratorTest26Query$variables;
export type RelayMockPayloadGeneratorTest26Query$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayMockPayloadGeneratorTest29Fragment$fragmentType & RelayMockPayloadGeneratorTest30Fragment$fragmentType,
  |},
|};
export type RelayMockPayloadGeneratorTest26QueryResponse = RelayMockPayloadGeneratorTest26Query$data;
export type RelayMockPayloadGeneratorTest26Query = {|
  variables: RelayMockPayloadGeneratorTest26QueryVariables,
  response: RelayMockPayloadGeneratorTest26Query$data,
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
    "name": "RelayMockPayloadGeneratorTest26Query",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest29Fragment"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayMockPayloadGeneratorTest30Fragment"
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
    "name": "RelayMockPayloadGeneratorTest26Query",
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
                "alias": "pageName",
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "type": "Page",
            "abstractKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": "userName",
                "args": null,
                "kind": "ScalarField",
                "name": "name",
                "storageKey": null
              }
            ],
            "type": "User",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "f44bf86d70b4014c9aa01d693a7a95b8",
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
        "node.pageName": (v1/*: any*/),
        "node.userName": (v1/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest26Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest26Query {\n  node(id: \"my-id\") {\n    __typename\n    ...RelayMockPayloadGeneratorTest29Fragment\n    ...RelayMockPayloadGeneratorTest30Fragment\n    id\n  }\n}\n\nfragment RelayMockPayloadGeneratorTest29Fragment on Page {\n  id\n  pageName: name\n}\n\nfragment RelayMockPayloadGeneratorTest30Fragment on User {\n  id\n  userName: name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7a9885b7c8d5c02b3497ea60e2d3097c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest26Query$variables,
  RelayMockPayloadGeneratorTest26Query$data,
>*/);
