/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<14534e07cee00ca4a0e69b16777a2a44>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserBestFriendGreetingResolver$key } from "./../resolvers/__generated__/UserBestFriendGreetingResolver.graphql";
import {best_friend_greeting as userBestFriendGreetingResolverType} from "../resolvers/UserBestFriendGreetingResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userBestFriendGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userBestFriendGreetingResolverType: (
  rootKey: UserBestFriendGreetingResolver$key,
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTest4Query$variables = {||};
export type RelayReaderResolverTest4Query$data = {|
  +me: ?{|
    +best_friend_greeting: ?string,
  |},
|};
export type RelayReaderResolverTest4Query = {|
  response: RelayReaderResolverTest4Query$data,
  variables: RelayReaderResolverTest4Query$variables,
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
    "name": "RelayReaderResolverTest4Query",
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
              "name": "UserBestFriendGreetingResolver"
            },
            "kind": "RelayResolver",
            "name": "best_friend_greeting",
            "resolverModule": require('../resolvers/UserBestFriendGreetingResolver').best_friend_greeting,
            "path": "me.best_friend_greeting"
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
    "name": "RelayReaderResolverTest4Query",
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
            "name": "best_friend_greeting",
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
    "cacheID": "e11069822e7894ad66e8e777ff70977d",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTest4Query",
    "operationKind": "query",
    "text": "query RelayReaderResolverTest4Query {\n  me {\n    ...UserBestFriendGreetingResolver\n    id\n  }\n}\n\nfragment UserBestFriendGreetingResolver on User {\n  friends(first: 1) {\n    edges {\n      cursor\n      node {\n        name\n        id\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "85f26ff589c149207bceb6138ffe3f85";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTest4Query$variables,
  RelayReaderResolverTest4Query$data,
>*/);
