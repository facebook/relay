/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0d3e6c9a32e518d844e33cb2963746e5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType: FragmentType;
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$ref = RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType;
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data = {|
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
        +name: ?string,
      |},
    |}>,
  |},
  +$refType: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
  +$fragmentType: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
|};
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends = RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data;
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$key = {
  +$data?: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data,
  +$fragmentRefs: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
  +$fragmentSpreads: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
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
  (node/*: any*/).hash = "e45a7509609fa1b14dd78b33161d82f0";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType,
  RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data,
>*/);
