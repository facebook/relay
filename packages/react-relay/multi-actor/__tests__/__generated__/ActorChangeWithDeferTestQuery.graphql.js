/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5346e5bf3e9b9c91f764a934f038b756>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ActorChangePoint } from "react-relay/multi-actor";
type ActorChangeWithDeferTestFragment$fragmentType = any;
export type ActorChangeWithDeferTestQuery$variables = {||};
export type ActorChangeWithDeferTestQueryVariables = ActorChangeWithDeferTestQuery$variables;
export type ActorChangeWithDeferTestQuery$data = {|
  +viewer: ?{|
    +newsFeed: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?{|
          +actor: ?{|
            +name: ?string,
          |},
        |},
        +actor_node: ?ActorChangePoint<{|
          +actor_key: string,
          +$fragmentSpreads: ActorChangeWithDeferTestFragment$fragmentType,
        |}>,
      |}>,
    |},
  |},
|};
export type ActorChangeWithDeferTestQueryResponse = ActorChangeWithDeferTestQuery$data;
export type ActorChangeWithDeferTestQuery = {|
  variables: ActorChangeWithDeferTestQueryVariables,
  response: ActorChangeWithDeferTestQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
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
},
v3 = {
  "alias": null,
  "args": null,
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v1/*: any*/),
    (v0/*: any*/),
    (v2/*: any*/)
  ],
  "storageKey": null
},
v4 = {
  "kind": "TypeDiscriminator",
  "abstractKey": "__isFeedUnit"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ActorChangeWithDeferTestQuery",
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
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": null,
                        "kind": "LinkedField",
                        "name": "actor",
                        "plural": false,
                        "selections": [
                          (v0/*: any*/)
                        ],
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  },
                  {
                    "kind": "ActorChange",
                    "alias": "actor_node",
                    "name": "node",
                    "storageKey": null,
                    "args": null,
                    "fragmentSpread": {
                      "args": null,
                      "kind": "FragmentSpread",
                      "name": "ActorChangeWithDeferTestFragment"
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
    "name": "ActorChangeWithDeferTestQuery",
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
                    "alias": null,
                    "args": null,
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      (v1/*: any*/),
                      (v3/*: any*/),
                      (v2/*: any*/)
                    ],
                    "storageKey": null
                  },
                  {
                    "kind": "ActorChange",
                    "linkedField": {
                      "alias": "actor_node",
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "node",
                      "plural": false,
                      "selections": [
                        (v1/*: any*/),
                        (v4/*: any*/),
                        (v2/*: any*/),
                        (v3/*: any*/),
                        {
                          "if": null,
                          "kind": "Defer",
                          "label": "ActorChangeWithDeferTestFragment$defer$ActorChangeWithDeferTestDeferFragment",
                          "selections": [
                            (v4/*: any*/),
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
                            }
                          ]
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
    "cacheID": "878ffbe2b2e192cee6ea324706e70741",
    "id": null,
    "metadata": {},
    "name": "ActorChangeWithDeferTestQuery",
    "operationKind": "query",
    "text": "query ActorChangeWithDeferTestQuery {\n  viewer {\n    newsFeed {\n      edges {\n        node {\n          __typename\n          actor {\n            __typename\n            name\n            id\n          }\n          id\n        }\n        actor_node: node @fb_actor_change {\n          __typename\n          ...ActorChangeWithDeferTestFragment\n          actor_key\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment ActorChangeWithDeferTestDeferFragment on FeedUnit {\n  __isFeedUnit: __typename\n  message {\n    text\n  }\n}\n\nfragment ActorChangeWithDeferTestFragment on FeedUnit {\n  __isFeedUnit: __typename\n  id\n  actor {\n    __typename\n    name\n    id\n  }\n  ...ActorChangeWithDeferTestDeferFragment @defer(label: \"ActorChangeWithDeferTestFragment$defer$ActorChangeWithDeferTestDeferFragment\")\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5140be47d96491c09c1d7e9dac4df2ee";
}

module.exports = ((node/*: any*/)/*: Query<
  ActorChangeWithDeferTestQuery$variables,
  ActorChangeWithDeferTestQuery$data,
>*/);
