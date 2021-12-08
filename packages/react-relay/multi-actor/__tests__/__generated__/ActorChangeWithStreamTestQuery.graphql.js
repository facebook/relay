/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b9a1a6612eb1ce8cf339ff6bea5482c7>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ActorChangePoint } from "react-relay/multi-actor";
type ActorChangeWithStreamTestFragment$fragmentType = any;
export type ActorChangeWithStreamTestQuery$variables = {||};
export type ActorChangeWithStreamTestQueryVariables = ActorChangeWithStreamTestQuery$variables;
export type ActorChangeWithStreamTestQuery$data = {|
  +viewer: ?{|
    +newsFeed: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?ActorChangePoint<{|
          +actor_key: string,
          +$fragmentSpreads: ActorChangeWithStreamTestFragment$fragmentType,
        |}>,
      |}>,
    |},
  |},
|};
export type ActorChangeWithStreamTestQueryResponse = ActorChangeWithStreamTestQuery$data;
export type ActorChangeWithStreamTestQuery = {|
  variables: ActorChangeWithStreamTestQueryVariables,
  response: ActorChangeWithStreamTestQuery$data,
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
                              ]
                            }
                          ],
                          "storageKey": null
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "actor_key",
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
    "cacheID": "af2db8fd534769c172bc84e7a133c65a",
    "id": null,
    "metadata": {},
    "name": "ActorChangeWithStreamTestQuery",
    "operationKind": "query",
    "text": "query ActorChangeWithStreamTestQuery {\n  viewer {\n    newsFeed {\n      edges {\n        node @fb_actor_change {\n          __typename\n          ...ActorChangeWithStreamTestFragment\n          actor_key\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment ActorChangeWithStreamTestFragment on FeedUnit {\n  __isFeedUnit: __typename\n  id\n  message {\n    text\n  }\n  feedback {\n    id\n    actors @stream(label: \"ActorChangeWithStreamTestFragment$stream$actors\", initial_count: 1) {\n      __typename\n      name\n      id\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "d36707add9f4e27149d6e1bf38a04360";
}

module.exports = ((node/*: any*/)/*: Query<
  ActorChangeWithStreamTestQuery$variables,
  ActorChangeWithStreamTestQuery$data,
>*/);
