/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<061e5efd9fe73cd53b080bf77b81822c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3QueryVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query$data = {|
  +node: ?{|
    +comments: ?{|
      +__id: string,
      +edges: ?$ReadOnlyArray<?{|
        +__typename: string,
        +node: ?{|
          +id: string,
        |},
      |}>,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3QueryResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3QueryVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query$data,
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
  "kind": "Literal",
  "name": "orderby",
  "value": "date"
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v5 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "CommentsEdge",
    "kind": "LinkedField",
    "name": "edges",
    "plural": true,
    "selections": [
      (v3/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Comment",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v4/*: any*/),
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
  },
  {
    "kind": "ClientExtension",
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "__id",
        "storageKey": null
      }
    ]
  }
],
v6 = [
  {
    "kind": "Literal",
    "name": "first",
    "value": 2
  },
  (v2/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query",
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
            "alias": "comments",
            "args": [
              (v2/*: any*/)
            ],
            "concreteType": "CommentsConnection",
            "kind": "LinkedField",
            "name": "__FeedbackFragment_comments_connection",
            "plural": false,
            "selections": (v5/*: any*/),
            "storageKey": "__FeedbackFragment_comments_connection(orderby:\"date\")"
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query",
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
            "alias": null,
            "args": (v6/*: any*/),
            "concreteType": "CommentsConnection",
            "kind": "LinkedField",
            "name": "comments",
            "plural": false,
            "selections": (v5/*: any*/),
            "storageKey": "comments(first:2,orderby:\"date\")"
          },
          {
            "alias": null,
            "args": (v6/*: any*/),
            "filters": [
              "orderby"
            ],
            "handle": "connection",
            "key": "FeedbackFragment_comments",
            "kind": "LinkedHandle",
            "name": "comments"
          },
          (v4/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "232c66e04491098a14c79cc32aeee939",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    comments(first: 2, orderby: \"date\") {\n      edges {\n        __typename\n        node {\n          id\n          __typename\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "78fd9497990ef3d977dfe89712d3101a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback3Query$data,
>*/);
