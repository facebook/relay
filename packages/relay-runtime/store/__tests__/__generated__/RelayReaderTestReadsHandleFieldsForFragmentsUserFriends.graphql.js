/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2faaa1562b4e439da2112e5b5982102c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$ref: FragmentReference;
declare export opaque type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$fragmentType: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$ref;
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends = {|
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
        +name: ?string,
      |},
    |}>,
  |},
  +$refType: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$ref,
|};
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data = RelayReaderTestReadsHandleFieldsForFragmentsUserFriends;
export type RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$key = {
  +$data?: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$data,
  +$fragmentRefs: RelayReaderTestReadsHandleFieldsForFragmentsUserFriends$ref,
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

module.exports = node;
