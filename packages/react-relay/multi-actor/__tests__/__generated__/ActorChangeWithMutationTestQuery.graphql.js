/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<71bdb7290f1b51fd3bf60fa858bcec8d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ActorChangePoint } from "react-relay/multi-actor";
type ActorChangeWithMutationTestFragment$fragmentType = any;
export type ActorChangeWithMutationTestQuery$variables = {||};
export type ActorChangeWithMutationTestQueryVariables = ActorChangeWithMutationTestQuery$variables;
export type ActorChangeWithMutationTestQuery$data = {|
  +viewer: ?{|
    +actor: ?{|
      +id: string,
      +name: ?string,
    |},
    +newsFeed: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?ActorChangePoint<{|
          +actor_key: string,
          +$fragmentSpreads: ActorChangeWithMutationTestFragment$fragmentType,
        |}>,
      |}>,
    |},
  |},
|};
export type ActorChangeWithMutationTestQueryResponse = ActorChangeWithMutationTestQuery$data;
export type ActorChangeWithMutationTestQuery = {|
  variables: ActorChangeWithMutationTestQueryVariables,
  response: ActorChangeWithMutationTestQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
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
  "concreteType": null,
  "kind": "LinkedField",
  "name": "actor",
  "plural": false,
  "selections": [
    (v2/*: any*/),
    (v0/*: any*/),
    (v1/*: any*/)
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ActorChangeWithMutationTestQuery",
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
            "concreteType": null,
            "kind": "LinkedField",
            "name": "actor",
            "plural": false,
            "selections": [
              (v0/*: any*/),
              (v1/*: any*/)
            ],
            "storageKey": null
          },
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
                      "name": "ActorChangeWithMutationTestFragment"
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
    "name": "ActorChangeWithMutationTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          (v3/*: any*/),
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
                        (v2/*: any*/),
                        {
                          "kind": "TypeDiscriminator",
                          "abstractKey": "__isFeedUnit"
                        },
                        (v0/*: any*/),
                        (v3/*: any*/),
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
    "cacheID": "fd6809104452f2818ef6b2a1cbf70b48",
    "id": null,
    "metadata": {},
    "name": "ActorChangeWithMutationTestQuery",
    "operationKind": "query",
    "text": "query ActorChangeWithMutationTestQuery {\n  viewer {\n    actor {\n      __typename\n      id\n      name\n    }\n    newsFeed {\n      edges {\n        node @fb_actor_change {\n          __typename\n          ...ActorChangeWithMutationTestFragment\n          actor_key\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment ActorChangeWithMutationTestFragment on FeedUnit {\n  __isFeedUnit: __typename\n  id\n  actor {\n    __typename\n    id\n    name\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f97bcaa13a859b2b03d3e1ae718f37ae";
}

module.exports = ((node/*: any*/)/*: Query<
  ActorChangeWithMutationTestQuery$variables,
  ActorChangeWithMutationTestQuery$data,
>*/);
