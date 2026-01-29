/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6df53546f89a0e3fe557a85da970ddde>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$fragmentType } from "./RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment.graphql";
export type RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery$variables = {|
  commentsKey?: ?string,
  id: string,
|};
export type RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery = {|
  response: RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery$data,
  variables: RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "commentsKey"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "id"
},
v2 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
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
    "kind": "Literal",
    "name": "first",
    "value": 2
  },
  {
    "kind": "Literal",
    "name": "orderby",
    "value": "date"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment"
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          (v4/*: any*/),
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
                  }
                ],
                "storageKey": "comments(first:2,orderby:\"date\")"
              },
              {
                "alias": null,
                "args": (v5/*: any*/),
                "filters": [
                  "orderby"
                ],
                "handle": "connection",
                "key": "RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment_comments",
                "kind": "LinkedHandle",
                "name": "comments",
                "dynamicKey": {
                  "kind": "Variable",
                  "name": "__dynamicKey",
                  "variableName": "commentsKey"
                }
              }
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
    "cacheID": "ebb789ef9d0eca9a164bb1ff564792ba",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentDynamicConnectionKeyTestFeedbackFragment on Feedback {\n  id\n  comments(first: 2, orderby: \"date\") {\n    edges {\n      node {\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b57fa82fe4a28fee879d610ee77676d0";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery$variables,
  RelayModernEnvironmentDynamicConnectionKeyTestFeedbackQuery$data,
>*/);
