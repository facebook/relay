/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<154fb62746c91997077965999cf22ae8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type requestSubscriptionTestFeedbackCommentQuery$variables = {|
  id?: ?string,
|};
export type requestSubscriptionTestFeedbackCommentQueryVariables = requestSubscriptionTestFeedbackCommentQuery$variables;
export type requestSubscriptionTestFeedbackCommentQuery$data = {|
  +node: ?{|
    +comments?: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +id: string,
          +body: ?{|
            +text: ?string,
          |},
        |},
      |}>,
    |},
  |},
|};
export type requestSubscriptionTestFeedbackCommentQueryResponse = requestSubscriptionTestFeedbackCommentQuery$data;
export type requestSubscriptionTestFeedbackCommentQuery = {|
  variables: requestSubscriptionTestFeedbackCommentQueryVariables,
  response: requestSubscriptionTestFeedbackCommentQuery$data,
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
            "name": "body",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "text",
                "storageKey": null
              }
            ],
            "storageKey": null
          },
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
    "value": 2
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "requestSubscriptionTestFeedbackCommentQuery",
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
              {
                "alias": "comments",
                "args": null,
                "concreteType": "CommentsConnection",
                "kind": "LinkedField",
                "name": "__FeedbackCommentQuery_comments_connection",
                "plural": false,
                "selections": (v4/*: any*/),
                "storageKey": null
              }
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
    "name": "requestSubscriptionTestFeedbackCommentQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
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
                "concreteType": "CommentsConnection",
                "kind": "LinkedField",
                "name": "comments",
                "plural": false,
                "selections": (v4/*: any*/),
                "storageKey": "comments(first:2)"
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "FeedbackCommentQuery_comments",
                "kind": "LinkedHandle",
                "name": "comments"
              }
            ],
            "type": "Feedback",
            "abstractKey": null
          },
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "210dd221c7be27116ee921df39eeb06e",
    "id": null,
    "metadata": {
      "connection": [
        {
          "count": null,
          "cursor": null,
          "direction": "forward",
          "path": [
            "node",
            "comments"
          ]
        }
      ]
    },
    "name": "requestSubscriptionTestFeedbackCommentQuery",
    "operationKind": "query",
    "text": "query requestSubscriptionTestFeedbackCommentQuery(\n  $id: ID\n) {\n  node(id: $id) {\n    __typename\n    ... on Feedback {\n      comments(first: 2) {\n        edges {\n          node {\n            id\n            body {\n              text\n            }\n            __typename\n          }\n          cursor\n        }\n        pageInfo {\n          endCursor\n          hasNextPage\n        }\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "996046673b6bc26bab075ef2da371fd3";
}

module.exports = ((node/*: any*/)/*: Query<
  requestSubscriptionTestFeedbackCommentQuery$variables,
  requestSubscriptionTestFeedbackCommentQuery$data,
>*/);
