/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3cd1cb9f80eddfc2b9e1c2f6a1218625>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type UserBestFriendGreetingResolver$fragmentType: FragmentType;
export type UserBestFriendGreetingResolver$data = {
  readonly friends: ?{
    readonly edges: ?ReadonlyArray<?{
      readonly cursor: ?string,
      readonly node: ?{
        readonly name: ?string,
      },
    }>,
  },
  readonly $fragmentType: UserBestFriendGreetingResolver$fragmentType,
};
export type UserBestFriendGreetingResolver$key = {
  readonly $data?: UserBestFriendGreetingResolver$data,
  readonly $fragmentSpreads: UserBestFriendGreetingResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserBestFriendGreetingResolver",
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
  (node/*:: as any*/).hash = "a42ddde1e902b99ed68e5b6adef52956";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  UserBestFriendGreetingResolver$fragmentType,
  UserBestFriendGreetingResolver$data,
>*/);
