/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ba8a75ec48a3079f9d35ebb0f59f6619>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$variables = {|
  enableStream: boolean,
  after?: ?string,
|};
export type RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQueryVariables = RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$variables;
export type RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$data = {|
  +viewer: ?{|
    +__typename: string,
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQueryResponse = RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$data;
export type RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery = {|
  variables: RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQueryVariables,
  response: RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "after"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "enableStream"
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
    "kind": "Variable",
    "name": "after",
    "variableName": "after"
  },
  {
    "kind": "Literal",
    "name": "first",
    "value": 10
  }
],
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment"
              }
            ]
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
    "name": "RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$defer$FeedFragment",
            "selections": [
              {
                "alias": null,
                "args": (v3/*: any*/),
                "concreteType": "NewsFeedConnection",
                "kind": "LinkedField",
                "name": "newsFeed",
                "plural": false,
                "selections": [
                  {
                    "if": "enableStream",
                    "kind": "Stream",
                    "label": "RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment$stream$newsFeed",
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "NewsFeedEdge",
                        "kind": "LinkedField",
                        "name": "edges",
                        "plural": true,
                        "selections": [
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "cursor",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": null,
                            "kind": "LinkedField",
                            "name": "node",
                            "plural": false,
                            "selections": [
                              (v2/*: any*/),
                              (v4/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "concreteType": "Feedback",
                                "kind": "LinkedField",
                                "name": "feedback",
                                "plural": false,
                                "selections": [
                                  (v4/*: any*/),
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "actors",
                                    "plural": true,
                                    "selections": [
                                      (v2/*: any*/),
                                      (v4/*: any*/),
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
                                        "filters": null,
                                        "handle": "name_handler",
                                        "key": "",
                                        "kind": "ScalarHandle",
                                        "name": "name"
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
                      }
                    ]
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
                "storageKey": null
              },
              {
                "alias": null,
                "args": (v3/*: any*/),
                "filters": null,
                "handle": "connection",
                "key": "RelayModernEnvironment_newsFeed",
                "kind": "LinkedHandle",
                "name": "newsFeed"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "c7df81f2b1ba926ad186b82e43ba2a10",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery(\n  $enableStream: Boolean!\n  $after: ID\n) {\n  viewer {\n    __typename\n    ...RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment @defer(label: \"RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$defer$FeedFragment\")\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment on Viewer {\n  newsFeed(first: 10, after: $after) {\n    edges @stream(label: \"RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedFragment$stream$newsFeed\", if: $enableStream, initial_count: 0) {\n      cursor\n      node {\n        __typename\n        id\n        feedback {\n          id\n          actors {\n            __typename\n            id\n            name\n          }\n        }\n      }\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "da3bd0b60a87ce2c3aee53776f2f43bd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$variables,
  RelayModernEnvironmentExecuteWithDeferredStreamedConnectionTestFeedQuery$data,
>*/);
