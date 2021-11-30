/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d68d2b929e754ecd7294aaf62b885124>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$fragmentType = any;
export type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery$variables = {|
  enableStream: boolean,
  after?: ?string,
|};
export type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQueryVariables = RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery$variables;
export type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery$data = {|
  +viewer: ?{|
    +$fragmentSpreads: RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$fragmentType,
  |},
|};
export type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQueryResponse = RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery$data;
export type RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery = {|
  variables: RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQueryVariables,
  response: RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery$data,
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
v2 = [
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
};
return {
  "fragment": {
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment"
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
    "name": "RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": (v2/*: any*/),
            "concreteType": "NewsFeedConnection",
            "kind": "LinkedField",
            "name": "newsFeed",
            "plural": false,
            "selections": [
              {
                "if": "enableStream",
                "kind": "Stream",
                "label": "RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed",
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
                          (v3/*: any*/),
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
                                  (v3/*: any*/),
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
                "if": "enableStream",
                "kind": "Defer",
                "label": "RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$defer$RelayModernEnvironment_newsFeed$pageInfo",
                "selections": [
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
                ]
              }
            ],
            "storageKey": null
          },
          {
            "alias": null,
            "args": (v2/*: any*/),
            "filters": null,
            "handle": "connection",
            "key": "RelayModernEnvironment_newsFeed",
            "kind": "LinkedHandle",
            "name": "newsFeed"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "fa45f0a1eaf10b616009a43e0fb1a69d",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery(\n  $enableStream: Boolean!\n  $after: ID\n) {\n  viewer {\n    ...RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment on Viewer {\n  newsFeed(first: 10, after: $after) {\n    edges @stream(label: \"RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$stream$RelayModernEnvironment_newsFeed\", if: $enableStream, initial_count: 0) {\n      cursor\n      node {\n        __typename\n        id\n        feedback {\n          id\n          actors {\n            __typename\n            id\n            name\n          }\n        }\n      }\n    }\n    ... @defer(label: \"RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedFragment$defer$RelayModernEnvironment_newsFeed$pageInfo\", if: $enableStream) {\n      pageInfo {\n        endCursor\n        hasNextPage\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "82b74c724400cf33ab9135fc73b2301a";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery$variables,
  RelayModernEnvironmentExecuteWithStreamedConnectionTestFeedQuery$data,
>*/);
