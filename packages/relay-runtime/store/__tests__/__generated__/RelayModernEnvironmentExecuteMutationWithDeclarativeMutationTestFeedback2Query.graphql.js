/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<625e118f7dfcfc3e628fbae164a41623>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query$variables = {|
  id: string,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query$data = {|
  +node: ?{|
    +comments: ?{|
      +__id: string,
      +edges: ?ReadonlyArray<?{|
        +__typename: "CommentsEdge",
        +node: ?{|
          +__typename: "Comment",
          +id: string,
        |},
      |}>,
    |},
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query = {|
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query$data,
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query$variables,
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
      (v3/*:: as any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Comment",
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          (v4/*:: as any*/)
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
  (v2/*:: as any*/)
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": "comments",
            "args": [
              (v2/*:: as any*/)
            ],
            "concreteType": "CommentsConnection",
            "kind": "LinkedField",
            "name": "__FeedbackFragment_comments_connection",
            "plural": false,
            "selections": (v5/*:: as any*/),
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
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*:: as any*/),
          {
            "alias": null,
            "args": (v6/*:: as any*/),
            "concreteType": "CommentsConnection",
            "kind": "LinkedField",
            "name": "comments",
            "plural": false,
            "selections": (v5/*:: as any*/),
            "storageKey": "comments(first:2,orderby:\"date\")"
          },
          {
            "alias": null,
            "args": (v6/*:: as any*/),
            "filters": [
              "orderby"
            ],
            "handle": "connection",
            "key": "FeedbackFragment_comments",
            "kind": "LinkedHandle",
            "name": "comments"
          },
          (v4/*:: as any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "5eeeb39b6b85d27d2eab4a102c32d372",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    comments(first: 2, orderby: \"date\") {\n      edges {\n        __typename\n        node {\n          __typename\n          id\n        }\n        cursor\n      }\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "c583d21cd38aafdb42c7749de85fa253";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestFeedback2Query$data,
>*/);
