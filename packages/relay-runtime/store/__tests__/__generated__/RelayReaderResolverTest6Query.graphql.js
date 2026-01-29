/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<98e4bfbb28332b751e6a803728b28fde>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserBestFriendShoutedGreetingResolver$key } from "./../resolvers/__generated__/UserBestFriendShoutedGreetingResolver.graphql";
import {best_friend_shouted_greeting as userBestFriendShoutedGreetingResolverType} from "../resolvers/UserBestFriendShoutedGreetingResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userBestFriendShoutedGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userBestFriendShoutedGreetingResolverType: (
  rootKey: UserBestFriendShoutedGreetingResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTest6Query$variables = {||};
export type RelayReaderResolverTest6Query$data = {|
  +me: ?{|
    +best_friend_shouted_greeting: ?string,
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
            "resolverModule": require('../resolvers/UserBestFriendShoutedGreetingResolver').best_friend_shouted_greeting,
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
            "name": "best_friend_shouted_greeting",
            "args": null,
            "fragment": {
              "kind": "InlineFragment",
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
                              "name": "greeting",
                              "args": null,
                              "fragment": {
                                "kind": "InlineFragment",
                                "selections": [
                                  {
                                    "alias": null,
                                    "args": null,
                                    "kind": "ScalarField",
                                    "name": "name",
                                    "storageKey": null
                                  }
                                ],
                                "type": "User",
                                "abstractKey": null
                              },
                              "kind": "RelayResolver",
                              "storageKey": null,
                              "isOutputType": true
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
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
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
