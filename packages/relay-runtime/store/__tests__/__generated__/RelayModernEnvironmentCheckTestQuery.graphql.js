/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3d19c3c6ecd0a5589e4513404e525e15>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ActorChangePoint } from "react-relay/multi-actor";
type RelayModernEnvironmentCheckTestFragment$fragmentType = any;
export type RelayModernEnvironmentCheckTestQuery$variables = {||};
export type RelayModernEnvironmentCheckTestQueryVariables = RelayModernEnvironmentCheckTestQuery$variables;
export type RelayModernEnvironmentCheckTestQuery$data = {|
  +viewer: ?{|
    +newsFeed: ?{|
      +edges: ?$ReadOnlyArray<?{|
        +node: ?ActorChangePoint<{|
          +actor_key: string,
          +$fragmentSpreads: RelayModernEnvironmentCheckTestFragment$fragmentType,
        |}>,
      |}>,
    |},
  |},
|};
export type RelayModernEnvironmentCheckTestQueryResponse = RelayModernEnvironmentCheckTestQuery$data;
export type RelayModernEnvironmentCheckTestQuery = {|
  variables: RelayModernEnvironmentCheckTestQueryVariables,
  response: RelayModernEnvironmentCheckTestQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentCheckTestQuery",
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
                      "name": "RelayModernEnvironmentCheckTestFragment"
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
    "name": "RelayModernEnvironmentCheckTestQuery",
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
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "__typename",
                          "storageKey": null
                        },
                        {
                          "kind": "TypeDiscriminator",
                          "abstractKey": "__isFeedUnit"
                        },
                        {
                          "alias": null,
                          "args": null,
                          "kind": "ScalarField",
                          "name": "id",
                          "storageKey": null
                        },
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
    "cacheID": "69b52b9bb0c3a52b2e043745e79b8926",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentCheckTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentCheckTestQuery {\n  viewer {\n    newsFeed {\n      edges {\n        node @fb_actor_change {\n          __typename\n          ...RelayModernEnvironmentCheckTestFragment\n          actor_key\n          id\n        }\n      }\n    }\n  }\n}\n\nfragment RelayModernEnvironmentCheckTestFragment on FeedUnit {\n  __isFeedUnit: __typename\n  id\n  message {\n    text\n  }\n}\n"
  }
};

if (__DEV__) {
  (node/*: any*/).hash = "3167042d144edcf3764590d0c3bbc1e4";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentCheckTestQuery$variables,
  RelayModernEnvironmentCheckTestQuery$data,
>*/);
