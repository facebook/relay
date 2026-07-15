/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f5e42411c30d42d07d5c2c00afaa4fba>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType: FragmentType;
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data = {
  readonly friends: ?{
    readonly edges: ?ReadonlyArray<?{
      readonly cursor: ?string,
      readonly node: ?{
        readonly id: string,
        readonly name: ?string,
      },
    }>,
  },
  readonly $fragmentType: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
};
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$key = {
  readonly $data?: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data,
  readonly $fragmentSpreads: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestReadsHandleFieldsForFragmentsUserFriends",
  "selections": [
    {
      "alias": "friends",
      "args": null,
      "concreteType": "FriendsConnection",
      "kind": "LinkedField",
      "name": "__friends_bestFriends",
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
                  "name": "id",
                  "storageKey": null
                },
                {
                  "alias": "name",
                  "args": null,
                  "kind": "ScalarField",
                  "name": "__name_friendsName",
                  "storageKey": null
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
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "e45a7509609fa1b14dd78b33161d82f0";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
  RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data,
>*/);
