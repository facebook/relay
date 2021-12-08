/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<bbefe381b5599342d7831c10af4a9b88>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type commitMutationTest4Query$variables = {||};
export type commitMutationTest4QueryVariables = commitMutationTest4Query$variables;
export type commitMutationTest4Query$data = {|
  +node: ?{|
    +topLevelComments?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
        |},
      |}>,
    |},
  |},
|};
export type commitMutationTest4QueryResponse = commitMutationTest4Query$data;
export type commitMutationTest4Query = {|
  variables: commitMutationTest4QueryVariables,
  response: commitMutationTest4Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "feedback123"
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
  "name": "__typename",
  "storageKey": null
},
v3 = [
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
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "cursor",
        "storageKey": null
      }
    ],
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "concreteType": "PageInfo",
    "kind": "LinkedField",
    "name": "pageInfo",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "endCursor",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "hasNextPage",
        "storageKey": null
      }
    ],
    "storageKey": null
  }
],
v4 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "commitMutationTest4Query",
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
              {
                "alias": "topLevelComments",
                "args": null,
                "concreteType": "TopLevelCommentsConnection",
                "kind": "LinkedField",
                "name": "__Feedback_topLevelComments_connection",
                "plural": false,
                "selections": (v3/*: any*/),
                "storageKey": null
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          }
        ],
        "storageKey": "node(id:\"feedback123\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "commitMutationTest4Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v4/*: any*/),
                "concreteType": "TopLevelCommentsConnection",
                "kind": "LinkedField",
                "name": "topLevelComments",
                "plural": false,
                "selections": (v3/*: any*/),
                "storageKey": "topLevelComments(first:1)"
              },
              {
                "alias": null,
                "args": (v4/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "Feedback_topLevelComments",
                "kind": "LinkedHandle",
                "name": "topLevelComments"
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          },
          (v1/*: any*/)
        ],
        "storageKey": "node(id:\"feedback123\")"
      }
    ]
  },
  "params": {
    "cacheID": "9926398f9765b8fb261950195711fb7a",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "node",
            "topLevelComments"
          ]
        }
      ]
    },
    "name": "commitMutationTest4Query",
    "operationKind": "query",
    "text": "query commitMutationTest4Query {\n  node(id: \"feedback123\") {\n    __typename\n    ... on Feedback {\n      topLevelComments(first: 1) {\n        edges {\n          node {\n            id\n            __typename\n          }\n          cursor\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7104dfb986be1868726cca080aac477b";
}

module.exports = ((node/*: any*/)/*: Query<
  commitMutationTest4Query$variables,
  commitMutationTest4Query$data,
>*/);
