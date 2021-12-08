/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<12a5e66100624306808129ddb43d63d2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentConnectionTestFeedbackFragment$fragmentType = any;
export type RelayModernEnvironmentConnectionTestFeedbackQuery$variables = {|
  id: string,
|};
export type RelayModernEnvironmentConnectionTestFeedbackQueryVariables = RelayModernEnvironmentConnectionTestFeedbackQuery$variables;
export type RelayModernEnvironmentConnectionTestFeedbackQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentConnectionTestFeedbackFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentConnectionTestFeedbackQueryResponse = RelayModernEnvironmentConnectionTestFeedbackQuery$data;
export type RelayModernEnvironmentConnectionTestFeedbackQuery = {|
  variables: RelayModernEnvironmentConnectionTestFeedbackQueryVariables,
  response: RelayModernEnvironmentConnectionTestFeedbackQuery$data,
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
  "name": "__typename",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v4 = [
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentConnectionTestFeedbackQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentConnectionTestFeedbackFragment"
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
    "name": "RelayModernEnvironmentConnectionTestFeedbackQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/),
          {
            "kind": "InlineFragment",
            "selections": [
              {
                "alias": null,
                "args": (v4/*: any*/),
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
                          (v3/*: any*/),
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
                "storageKey": "comments(first:2,orderby:\"date\")"
              },
              {
                "alias": null,
                "args": (v4/*: any*/),
                "filters": [
                  "orderby"
                ],
                "handle": "connection",
                "key": "RelayModernEnvironmentConnectionTestFeedbackFragment_comments",
                "kind": "LinkedHandle",
                "name": "comments"
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
    "cacheID": "3ee01cbbf677d660c751206748298042",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentConnectionTestFeedbackQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentConnectionTestFeedbackQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayModernEnvironmentConnectionTestFeedbackFragment\n    id\n  }\n}\n\nfragment RelayModernEnvironmentConnectionTestFeedbackFragment on Feedback {\n  id\n  comments(first: 2, orderby: \"date\") {\n    edges {\n      node {\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2ab9d05a46f4c1a555cdbc247557cb8a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentConnectionTestFeedbackQuery$variables,
  RelayModernEnvironmentConnectionTestFeedbackQuery$data,
>*/);
