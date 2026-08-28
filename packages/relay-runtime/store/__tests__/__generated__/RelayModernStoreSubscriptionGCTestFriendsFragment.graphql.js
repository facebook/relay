/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<865231d771d16398e6d0f55b348f2dc0>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernStoreSubscriptionGCTestFriendsFragment$fragmentType: FragmentType;
export type RelayModernStoreSubscriptionGCTestFriendsFragment$data = {
  readonly friends: ?{
    readonly edges: ?ReadonlyArray<?{
      readonly node: ?{
        readonly id: string,
        readonly name: ?string,
      },
    }>,
  },
  readonly $fragmentType: RelayModernStoreSubscriptionGCTestFriendsFragment$fragmentType,
};
export type RelayModernStoreSubscriptionGCTestFriendsFragment$key = {
  readonly $data?: RelayModernStoreSubscriptionGCTestFriendsFragment$data,
  readonly $fragmentSpreads: RelayModernStoreSubscriptionGCTestFriendsFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernStoreSubscriptionGCTestFriendsFragment",
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
              "concreteType": "User",
              "kind": "LinkedField",
              "name": "node",
              "plural": false,
              "selections": [
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
  (node/*:: as any*/).hash = "bfc7b1f8c851ae7b10adaa5c8372fe0f";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernStoreSubscriptionGCTestFriendsFragment$fragmentType,
  RelayModernStoreSubscriptionGCTestFriendsFragment$data,
>*/);
