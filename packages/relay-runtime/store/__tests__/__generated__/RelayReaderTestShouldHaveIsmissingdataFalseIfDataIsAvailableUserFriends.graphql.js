/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<08ac2edbbe0f0dd3de3e6c1d8ed9977f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$fragmentType: FragmentType;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$ref = RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$fragmentType;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$data = {|
  +id: string,
  +friends: ?{|
    +edges: ?$ReadOnlyArray<?{|
      +cursor: ?string,
      +node: ?{|
        +id: string,
      |},
    |}>,
  |},
  +$fragmentType: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$fragmentType,
|};
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends = RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$data;
export type RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$key = {
  +$data?: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$data,
  +$fragmentSpreads: RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": [
        {
          "kind": "Literal",
          "name": "first",
          "value": 3
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
                (v0/*: any*/)
              ],
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ],
      "storageKey": "friends(first:3)"
    }
  ],
  "type": "User",
  "abstractKey": null
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7ad43c68a307b4ff13f854acf3baeb28";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$fragmentType,
  RelayReaderTestShouldHaveIsmissingdataFalseIfDataIsAvailableUserFriends$data,
>*/);
