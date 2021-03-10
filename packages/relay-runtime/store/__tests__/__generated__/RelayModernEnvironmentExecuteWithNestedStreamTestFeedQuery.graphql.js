/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<87906bdb8acf3579b8d2795dc94a550f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
type RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$ref = any;
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedQueryVariables = {|
  enableStream: boolean,
|};
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedQueryResponse = {|
  +viewer: ?{|
    +$fragmentRefs: RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$ref,
  |},
|};
export type RelayModernEnvironmentExecuteWithNestedStreamTestFeedQuery = {|
  variables: RelayModernEnvironmentExecuteWithNestedStreamTestFeedQueryVariables,
  response: RelayModernEnvironmentExecuteWithNestedStreamTestFeedQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "enableStream"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteWithNestedStreamTestFeedQuery",
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
            "name": "RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment"
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
    "name": "RelayModernEnvironmentExecuteWithNestedStreamTestFeedQuery",
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
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 10
              }
            ],
            "concreteType": "NewsFeedConnection",
            "kind": "LinkedField",
            "name": "newsFeed",
            "plural": false,
            "selections": [
              {
                "if": "enableStream",
                "kind": "Stream",
                "label": "RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$newsFeed",
                "metadata": null,
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
                          (v1/*: any*/),
                          (v2/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "Feedback",
                            "kind": "LinkedField",
                            "name": "feedback",
                            "plural": false,
                            "selections": [
                              {
                                "if": "enableStream",
                                "kind": "Stream",
                                "label": "RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors",
                                "metadata": null,
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "concreteType": null,
                                    "kind": "LinkedField",
                                    "name": "actors",
                                    "plural": true,
                                    "selections": [
                                      (v1/*: any*/),
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
                                      },
                                      (v2/*: any*/)
                                    ],
                                    "storageKey": null
                                  }
                                ],
                                "useCustomizedBatch": null
                              },
                              (v2/*: any*/)
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
                "useCustomizedBatch": null
              }
            ],
            "storageKey": "newsFeed(first:10)"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "ef2633b42568136313ff7f1eb55148cf",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteWithNestedStreamTestFeedQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentExecuteWithNestedStreamTestFeedQuery(\n  $enableStream: Boolean!\n) {\n  viewer {\n    ...RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment\n  }\n}\n\nfragment RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment on Viewer {\n  newsFeed(first: 10) {\n    edges @stream(label: \"RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$newsFeed\", if: $enableStream, initial_count: 0) {\n      cursor\n      node {\n        __typename\n        id\n        feedback {\n          actors @stream(label: \"RelayModernEnvironmentExecuteWithNestedStreamTestFeedFragment$stream$actors\", if: $enableStream, initial_count: 0) {\n            __typename\n            name\n            id\n          }\n          id\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "0320449c8b7bac4f9ee4a98105c83e53";
}

module.exports = node;
