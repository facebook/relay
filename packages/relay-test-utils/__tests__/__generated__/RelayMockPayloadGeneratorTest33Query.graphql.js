/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c78a149aa3c9fb3cd8022bc6ebd63510>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest33Query$variables = {||};
export type RelayMockPayloadGeneratorTest33QueryVariables = RelayMockPayloadGeneratorTest33Query$variables;
export type RelayMockPayloadGeneratorTest33Query$data = {|
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
export type RelayMockPayloadGeneratorTest33QueryResponse = RelayMockPayloadGeneratorTest33Query$data;
export type RelayMockPayloadGeneratorTest33Query = {|
  variables: RelayMockPayloadGeneratorTest33QueryVariables,
  response: RelayMockPayloadGeneratorTest33Query$data,
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
    "name": "RelayMockPayloadGeneratorTest33Query",
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
    "name": "RelayMockPayloadGeneratorTest33Query",
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
    "cacheID": "ccbaf4173536d8ae437c7803c6c7787a",
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
    "name": "RelayMockPayloadGeneratorTest33Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest33Query {\n  node(id: \"my-id\") {\n    __typename\n    ... on User {\n      id\n      friends {\n        edges {\n          node {\n            id\n            name\n            profile_picture {\n              uri\n              width\n              height\n            }\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "068851c8354de16162cdb73f0fb56f18";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest33Query$variables,
  RelayMockPayloadGeneratorTest33Query$data,
>*/);
