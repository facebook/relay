/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<764e5e48fe16a54ff03a9bb268e9f37a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { UserGreetingResolver$key } from "./UserGreetingResolver.graphql";
import type { FragmentType } from "relay-runtime";
import {greeting as userGreetingResolverType} from "../UserGreetingResolver.js";
// Type assertion validating that `userGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userGreetingResolverType: (
  rootKey: UserGreetingResolver$key,
) => ?mixed);
declare export opaque type UserBestFriendShoutedGreetingResolver$fragmentType: FragmentType;
export type UserBestFriendShoutedGreetingResolver$data = {|
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +greeting: ?ReturnType<typeof userGreetingResolverType>,
      |},
    |}>,
  |},
  +$fragmentType: UserBestFriendShoutedGreetingResolver$fragmentType,
|};
export type UserBestFriendShoutedGreetingResolver$key = {
  +$data?: UserBestFriendShoutedGreetingResolver$data,
  +$fragmentSpreads: UserBestFriendShoutedGreetingResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserBestFriendShoutedGreetingResolver",
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
                  "fragment": {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "UserGreetingResolver"
                  },
                  "kind": "RelayResolver",
                  "name": "greeting",
                  "resolverModule": require('./../UserGreetingResolver').greeting,
                  "path": "friends.edges.node.greeting"
                }
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
};

if (__DEV__) {
  (node/*: any*/).hash = "0c4d2b81e30f58d15cfe3f72d4c15452";
}

module.exports = ((node/*: any*/)/*: Fragment<
  UserBestFriendShoutedGreetingResolver$fragmentType,
  UserBestFriendShoutedGreetingResolver$data,
>*/);
