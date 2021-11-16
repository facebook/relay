/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1c5b9b17141c01ecca225a19a5982457>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest31Query$variables = {||};
export type RelayMockPayloadGeneratorTest31QueryVariables = RelayMockPayloadGeneratorTest31Query$variables;
export type RelayMockPayloadGeneratorTest31Query$data = {|
  +node: ?{|
    +id?: string,
    +friends?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
          +name: ?string,
          +profile_picture: ?{|
            +uri: ?string,
            +width: ?number,
            +height: ?number,
          |},
        |},
      |}>,
    |},
  |},
|};
export type RelayMockPayloadGeneratorTest31QueryResponse = RelayMockPayloadGeneratorTest31Query$data;
export type RelayMockPayloadGeneratorTest31Query = {|
  variables: RelayMockPayloadGeneratorTest31QueryVariables,
  response: RelayMockPayloadGeneratorTest31Query$data,
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
  "concreteType": "FriendsConnection",
  "kind": "LinkedField",
  "name": "friends",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "FriendsEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v1/*: any*/),
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
              "concreteType": "Image",
              "kind": "LinkedField",
              "name": "profile_picture",
              "plural": false,
              "selections": [
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "uri",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "width",
                  "storageKey": null
                },
                {
                  "alias": null,
                  "args": null,
                  "kind": "ScalarField",
                  "name": "height",
                  "storageKey": null
                }
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v4 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest31Query",
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
    "name": "RelayMockPayloadGeneratorTest31Query",
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
          }
        ],
        "storageKey": "node(id:\"my-id\")"
      }
    ]
  },
  "params": {
    "cacheID": "a050a043f6fe3e6a60170d7e15139557",
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
        "node.friends": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "FriendsConnection"
        },
        "node.friends.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "FriendsEdge"
        },
        "node.friends.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "node.friends.edges.node.id": (v3/*: any*/),
        "node.friends.edges.node.name": (v4/*: any*/),
        "node.friends.edges.node.profile_picture": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Image"
        },
        "node.friends.edges.node.profile_picture.height": (v5/*: any*/),
        "node.friends.edges.node.profile_picture.uri": (v4/*: any*/),
        "node.friends.edges.node.profile_picture.width": (v5/*: any*/),
        "node.id": (v3/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest31Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest31Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      friends {\n        edges {\n          node {\n            id\n            name\n            profile_picture {\n              uri\n              width\n              height\n            }\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2bc81085ab1260c6f0bd74e5ec3ec90e";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest31Query$variables,
  RelayMockPayloadGeneratorTest31Query$data,
>*/);
