/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<21a8d00a37f4814d3d50eda23b0d17d3>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import userBestFriendShoutedGreetingResolver from "../../../../relay-test-utils-internal/resolvers/UserBestFriendShoutedGreetingResolver.js";
export type RelayReaderResolverTest6Query$variables = {||};
export type RelayReaderResolverTest6Query$data = {|
  +me: ?{|
    +best_friend_shouted_greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userBestFriendShoutedGreetingResolver>,
  |},
|};
export type RelayReaderResolverTest6Query = {|
  response: RelayReaderResolverTest6Query$data,
  variables: RelayReaderResolverTest6Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
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
    "name": "RelayReaderResolverTest6Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "UserBestFriendShoutedGreetingResolver"
            },
            "kind": "RelayResolver",
            "name": "best_friend_shouted_greeting",
            "resolverModule": require('./../../../../relay-test-utils-internal/resolvers/UserBestFriendShoutedGreetingResolver.js'),
            "path": "me.best_friend_shouted_greeting"
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
    "name": "RelayReaderResolverTest6Query",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": [
              {
                "kind": "Literal",
                "name": "first",
                "value": 1
              }
            ],
            "concreteType": "FriendsConnection",
            "kind": "LinkedField",
            "name": "friends",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "FriendsEdge",
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
                    "concreteType": "User",
                    "kind": "LinkedField",
                    "name": "node",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "name",
                        "storageKey": null
                      },
                      (v0/*: any*/)
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": "friends(first:1)"
          },
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b275539f1f2c1b437128915082d22f32",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest6Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest6Query {\n  me {\n    ...UserBestFriendShoutedGreetingResolver\n    id\n  }\n}\n\nfragment UserBestFriendShoutedGreetingResolver on User {\n  friends(first: 1) {\n    edges {\n      cursor\n      node {\n        ...UserGreetingResolver\n        id\n      }\n    }\n  }\n}\n\nfragment UserGreetingResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "80dc5662e3d0136fc0079c60f0bf0caf";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest6Query$variables,
  RelayReaderResolverTest6Query$data,
>*/);
