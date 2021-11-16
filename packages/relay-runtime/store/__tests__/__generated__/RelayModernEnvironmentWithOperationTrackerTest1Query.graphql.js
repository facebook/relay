/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c7da86d79dfdecfb2397e05d5ca87c36>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentWithOperationTrackerTest1Query$variables = {|
  id?: ?string,
|};
export type RelayModernEnvironmentWithOperationTrackerTest1QueryVariables = RelayModernEnvironmentWithOperationTrackerTest1Query$variables;
export type RelayModernEnvironmentWithOperationTrackerTest1Query$data = {|
  +node: ?{|
    +id?: string,
    +body?: ?{|
      +text: ?string,
    |},
    +comments?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
          +message: ?{|
            +text: ?string,
          |},
        |},
      |}>,
    |},
  |},
|};
export type RelayModernEnvironmentWithOperationTrackerTest1QueryResponse = RelayModernEnvironmentWithOperationTrackerTest1Query$data;
export type RelayModernEnvironmentWithOperationTrackerTest1Query = {|
  variables: RelayModernEnvironmentWithOperationTrackerTest1QueryVariables,
  response: RelayModernEnvironmentWithOperationTrackerTest1Query$data,
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
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "text",
    "storageKey": null
  }
],
v4 = {
  "alias": null,
  "args": null,
  "concreteType": "Text",
  "kind": "LinkedField",
  "name": "body",
  "plural": false,
  "selections": (v3/*: any*/),
  "storageKey": null
},
v5 = {
  "alias": null,
  "args": null,
  "concreteType": "CommentsConnection",
  "kind": "LinkedField",
  "name": "comments",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "CommentsEdge",
      "kind": "LinkedField",
      "name": "edges",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": "Comment",
          "kind": "LinkedField",
          "name": "node",
          "plural": false,
          "selections": [
            (v2/*: any*/),
            {
              "alias": null,
              "args": null,
              "concreteType": "Text",
              "kind": "LinkedField",
              "name": "message",
              "plural": false,
              "selections": (v3/*: any*/),
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
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Text"
},
v7 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v8 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentWithOperationTrackerTest1Query",
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
            "kind": "InlineFragment",
            "selections": [
              (v2/*: any*/),
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "type": "Feedback",
            "abstractKey": null
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
    "name": "RelayModernEnvironmentWithOperationTrackerTest1Query",
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
            "kind": "InlineFragment",
            "selections": [
              (v4/*: any*/),
              (v5/*: any*/)
            ],
            "type": "Feedback",
            "abstractKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c19e7aa70c9a3d52e213ac58b2caf17f",
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
        "node.body": (v6/*: any*/),
        "node.body.text": (v7/*: any*/),
        "node.comments": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "CommentsConnection"
        },
        "node.comments.edges": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "CommentsEdge"
        },
        "node.comments.edges.node": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Comment"
        },
        "node.comments.edges.node.id": (v8/*: any*/),
        "node.comments.edges.node.message": (v6/*: any*/),
        "node.comments.edges.node.message.text": (v7/*: any*/),
        "node.id": (v8/*: any*/)
      }
    },
    "name": "RelayModernEnvironmentWithOperationTrackerTest1Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentWithOperationTrackerTest1Query(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    ... on Feedback {\n      id\n      body {\n        text\n      }\n      comments {\n        edges {\n          node {\n            id\n            message {\n              text\n            }\n          }\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1b496533e1c1dd63b5800177b6a2c5f4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentWithOperationTrackerTest1Query$variables,
  RelayModernEnvironmentWithOperationTrackerTest1Query$data,
>*/);
