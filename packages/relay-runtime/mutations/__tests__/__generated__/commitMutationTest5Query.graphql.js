/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<9d5d9cd567bb74158e854f6c8cd99ad8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type commitMutationTest5Query$variables = {||};
export type commitMutationTest5QueryVariables = commitMutationTest5Query$variables;
export type commitMutationTest5Query$data = {|
  +node: ?{|
    +topLevelComments?: ?{|
      +count: ?number,
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
        |},
      |}>,
    |},
  |},
|};
export type commitMutationTest5QueryResponse = commitMutationTest5Query$data;
export type commitMutationTest5Query = {|
  variables: commitMutationTest5QueryVariables,
  response: commitMutationTest5Query$data,
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
  "kind": "Literal",
  "name": "orderBy",
  "value": "chronological"
},
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
  "name": "__typename",
  "storageKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "count",
    "storageKey": null
  },
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
          (v3/*: any*/)
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
v5 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 1
  },
  (v1/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "commitMutationTest5Query",
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
                "args": [
                  (v1/*: any*/)
                ],
                "concreteType": "TopLevelCommentsConnection",
                "kind": "LinkedField",
                "name": "__Feedback_topLevelComments_connection",
                "plural": false,
                "selections": (v4/*: any*/),
                "storageKey": "__Feedback_topLevelComments_connection(orderBy:\"chronological\")"
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
    "name": "commitMutationTest5Query",
    "selections": [
      {
        "alias": null,
        "args": (v0/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v5/*: any*/),
                "concreteType": "TopLevelCommentsConnection",
                "kind": "LinkedField",
                "name": "topLevelComments",
                "plural": false,
                "selections": (v4/*: any*/),
                "storageKey": "topLevelComments(first:1,orderBy:\"chronological\")"
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "filters": [
                  "orderBy"
                ],
                "handle": "connection",
                "key": "Feedback_topLevelComments",
                "kind": "LinkedHandle",
                "name": "topLevelComments"
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": "node(id:\"feedback123\")"
      }
    ]
  },
  "params": {
    "cacheID": "eee6ab9274db9c0b6081a27406322efc",
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
    "name": "commitMutationTest5Query",
    "operationKind": "query",
    "text": "query commitMutationTest5Query {\n  node(id: \"feedback123\") {\n    __typename\n    ... on Feedback {\n      topLevelComments(orderBy: chronological, first: 1) {\n        count\n        edges {\n          node {\n            id\n            __typename\n          }\n          cursor\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "95a7b3c5f4018a884d2df77e115a4db0";
}

module.exports = ((node/*: any*/)/*: Query<
  commitMutationTest5Query$variables,
  commitMutationTest5Query$data,
>*/);
