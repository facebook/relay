/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5ef3c2a1d34c232a4b6a1dada9f0fc4b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
import type { ActorChangePoint } from "react-relay/multi-actor";
type ActorChangeWithStreamTestFragment$ref = any;
export type ActorChangeWithStreamTestQueryVariables = {||};
export type ActorChangeWithStreamTestQueryResponse = {|
  +viewer: ?{|
    +newsFeed: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?ActorChangePoint<{|
          +__viewer: string,
          +$fragmentRefs: ActorChangeWithStreamTestFragment$ref,
        |}>,
      |}>,
    |},
  |},
|};
export type ActorChangeWithStreamTestQuery = {|
  variables: ActorChangeWithStreamTestQueryVariables,
  response: ActorChangeWithStreamTestQueryResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ActorChangeWithStreamTestQuery",
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
            "args": null,
            "concreteType": "NewsFeedConnection",
            "kind": "LinkedField",
            "name": "newsFeed",
            "plural": false,
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
                    "kind": "ActorChange",
                    "alias": null,
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "fragmentSpread": {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ActorChangeWithStreamTestFragment"
                    }
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
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ActorChangeWithStreamTestQuery",
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
            "args": null,
            "concreteType": "NewsFeedConnection",
            "kind": "LinkedField",
            "name": "newsFeed",
            "plural": false,
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
                    "kind": "ActorChange",
                    "linkedField": {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "node",
                      "plural": false,
                      "selections": [
                        (v0/*: any*/),
                        {
                          "kind": "TypeDiscriminator",
                          "abstractKey": "__isFeedUnit"
                        },
                        (v1/*: any*/),
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Text",
                          "kind": "LinkedField",
                          "name": "message",
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
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": "Feedback",
                          "kind": "LinkedField",
                          "name": "feedback",
                          "plural": false,
                          "selections": [
                            (v1/*: any*/),
                            {
                              "if": null,
                              "kind": "Stream",
                              "label": "ActorChangeWithStreamTestFragment$stream$actors",
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
                                    (v0/*: any*/),
                                    {
                                      "alias": null,
                                      "args": null,
                                      "kind": "ScalarField",
                                      "name": "name",
                                      "storageKey": null
                                    },
                                    (v1/*: any*/)
                                  ],
                                  "storageKey": null
                                }
                              ],
                              "useCustomizedBatch": null
                            }
                          ],
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "__viewer",
                          "storageKey": null
                        }
                      ],
                      "storageKey": null
                    }
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
  "params": {
    "cacheID": "be0061e6915a1fc52ee1fa364d8d6452",
    "id": null,
    "metadata": {},
    "name": "ActorChangeWithStreamTestQuery",
    "operationKind": "query",
    "text": "query ActorChangeWithStreamTestQuery {\n  viewer {\n    newsFeed {\n      edges {\n        node {\n          __typename\n          ...ActorChangeWithStreamTestFragment\n          __viewer\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment ActorChangeWithStreamTestFragment on FeedUnit {\n  __isFeedUnit: __typename\n  id\n  message {\n    text\n  }\n  feedback {\n    id\n    actors @stream(label: \"ActorChangeWithStreamTestFragment$stream$actors\", initial_count: 1) {\n      __typename\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a95b7afa50598a0657cf6298f8189f35";
}

module.exports = node;
